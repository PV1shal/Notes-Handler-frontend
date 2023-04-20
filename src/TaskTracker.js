import React, { useState, useEffect } from "react";
import tasksServices from "./Services/tasksServices";
import "./TaskTracker.css";

function TaskTracker() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [userName, setUserName] = useState("");
  const [taskDescription, setDescription] = useState('');
  const [taskStatus, setStatus] = useState('');
  const [taskDueDay, setDueDay] = useState('');
  const [showEditTask, setShowEditTask] = useState(false)
  const [clickedTask, setClickedTask] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("name");

  useEffect(() => {
    const storedName = localStorage.getItem("loggedInUser");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  useEffect(() => {
    if (userName) {
      localStorage.setItem("loggedInUser", userName);
    }

    // Gets Tasks from the DB
    tasksServices.getTaskByUserID(userName).then((res) => {
      const newTasks = res.data.Tasks.map((task) => ({
        name: task.title,
        user: task.taskOwner,
        description: task.description,
        status: task.status,
        dueDay: task.due,
        id: task._id
      }));
      setTasks(newTasks);
      setIsLoading(false);
    });
  }, [userName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskName.trim() === "") return;

    //Commenting out ID as db returns unique ID for each newly inserted task.
    // const id = Math.floor(Math.random() * 10000) + (Math.random() * 99);

    // Creates Task in the DB
    var data = {
      "task": {
        "taskOwner": userName,
        "title": taskName,
        "description": taskDescription,
        "status": taskStatus,
        "due": taskDueDay
      }
    }

    console.log(taskName, userName, taskDescription, taskStatus, taskDueDay);

    // Adds Task to DB and to the UI.

    tasksServices.addTask(data)
      .then((res) => {
        setTasks([...tasks, {
          name: taskName, user: userName,
          description: taskDescription, status: taskStatus,
          dueDay: taskDueDay, id: res.data._id
        }]);

        setTaskName("");
        setDescription("");
        setStatus("");
        setDueDay("");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDelete = (taskToDelete) => {
    setTasks(tasks.filter((task) => task !== taskToDelete));

    // Deletes Task from the DB.
    tasksServices.deleteTask(taskToDelete.id)
  };

  const handleEdit = (id) => {
    const thisTask = tasks.find((task) => task.id === id);
    setClickedTask(thisTask);
    setShowEditTask(!showEditTask);
  };

  const submitEdit = (id, updatedTask) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        return updatedTask;
      }
      return task;
    });
    setTasks(updatedTasks);
    setShowEditTask(false);

    // Update task in the DB

    var data = {
      "task": {
        "_id": id,
        "taskOwner": userName,
        "title": updatedTask.name,
        "description": updatedTask.description,
        "status": updatedTask.status,
        "due": updatedTask.dueDay
      }
    }
    tasksServices.updateTask(data)
      .catch((err) => { console.log(err) });
  };

  const filteredTasks = tasks
    .filter((task) => task.user === userName)
    .sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortOption === "description") {
        return a.description.localeCompare(b.description);
      } else if (sortOption === "status") {
        return a.status.localeCompare(b.status);
      } else if (sortOption === "dueDay") {
        return new Date(a.dueDay) - new Date(b.dueDay);
      } else {
        return 0;
      }
    });

  const SignOut = () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "/";
  };


  return (
    <div className="container">
      <div>
        <h1>{userName}'s Tasks</h1>
        <button onClick={() => SignOut()}>Logout</button>
      </div>

      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter task name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter task description"
            value={taskDescription}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter task status"
            value={taskStatus}
            onChange={(e) => setStatus(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter task due day"
            value={taskDueDay}
            onChange={(e) => setDueDay(e.target.value)}
          />
          <button type="submit">Add Task</button>
        </form>
      </div>

      <div>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="">Sort By</option>
          <option value="name">Name</option>
          <option value="description">Description</option>
          <option value="status">Status</option>
          <option value="dueDay">Due</option>
        </select>
      </div>

      <div>
        {showEditTask && (
          <form onSubmit={submitEdit.bind(null, clickedTask.id, clickedTask)}>
            <input
              type="text"
              placeholder="Enter task name"
              value={clickedTask.name}
              onChange={(e) =>
                setClickedTask({
                  ...clickedTask,
                  name: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Enter task description"
              value={clickedTask.description}
              onChange={(e) =>
                setClickedTask({
                  ...clickedTask,
                  description: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Enter task status"
              value={clickedTask.status}
              onChange={(e) =>
                setClickedTask({
                  ...clickedTask,
                  status: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Enter task due day"
              value={clickedTask.dueDay}
              onChange={(e) =>
                setClickedTask({
                  ...clickedTask,
                  dueDay: e.target.value,
                })
              }
            />
            <button type="submit">Edit Task</button>
          </form>
        )}
      </div>

      {
        isLoading ? (
          <div className="formLoader">
            <ul className="formLoading">
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </div>
        ) : (
            <ul>
              {filteredTasks.map((task, index) => (
                <li key={index}>
                  <div>
                    <p>Task Title: {task.name}</p>
                    <p>Description: {task.description}</p>
                    <p>Status: {task.status}</p>
                    <p>Due: {task.dueDay}</p>
                  </div>
                  <button onClick={() => handleDelete(task)}>Delete</button>
                  <button onClick={() => handleEdit(task.id)}>Edit</button>
                </li>
              ))}
            </ul>
        )
      }
    </div>
  );
}

export default TaskTracker;
