import React, { useState, useEffect } from "react";
import tasksServices from "./Services/tasksServices";
import ReactDatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css'
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
        dueDay: new Date(task.due).toISOString(),
        id: task._id
      }));
      setTasks(newTasks);
      setIsLoading(false);
    });
  }, [userName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskName.trim() === "" || taskDescription.trim() === "" || taskStatus.trim() === "" || taskDueDay.toString() === "") return;

    //Commenting out ID as db returns unique ID for each newly inserted task.
    // const id = Math.floor(Math.random() * 10000) + (Math.random() * 99);

    // Creates Task in the DB
    var data = {
      "task": {
        "taskOwner": userName,
        "title": taskName,
        "description": taskDescription,
        "status": taskStatus,
        "due": taskDueDay.toISOString(),
      }
    }

    // console.log(taskName, userName, taskDescription, taskStatus, taskDueDay);

    // Adds Task to DB and to the UI.

    tasksServices.addTask(data)
      .then((res) => {
        setTasks([...tasks, {
          name: taskName, user: userName,
          description: taskDescription, status: taskStatus,
          dueDay: taskDueDay.toISOString(), id: res.data._id
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
        <h1>Welcome to you tasks, {userName}</h1>
        <button className="logout" title="logout" onClick={() => SignOut()}>Logout</button>
      </div>

      <div className="New-Task-Form">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter task title"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter task description"
            value={taskDescription}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select value={taskStatus} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Select Status</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On hold">On hold</option>
          </select>

          <div>
            <ReactDatePicker selected={taskDueDay} onChange={(date) => setDueDay(date)} />
          </div>

          <button type="submit">Add Task</button>
        </form>
      </div>

      <div className="Sort">
        Sort by:
        <select style={{ marginLeft: "10px", marginBottom: "20px" }} value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="">Sort By</option>
          <option value="name">Name</option>
          <option value="description">Description</option>
          <option value="status">Status</option>
          <option value="dueDay">Due</option>
        </select>
      </div>

      <div>
        {showEditTask && (
          <div className="New-Task-Form">
            <h2>Edit Task:</h2>
            <form onSubmit={submitEdit.bind(null, clickedTask.id, clickedTask)}>
              <input
                type="text"
                placeholder="Enter task title"
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

              <select value={clickedTask.status} onChange={(e) => setClickedTask({
                ...clickedTask,
                status: e.target.value,
              })}>
                <option value="">Select Status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On hold">On hold</option>
              </select>

              <div>
                <ReactDatePicker
                  // showIcon
                  selected={new Date(clickedTask.dueDay)}
                  onChange={(date) =>
                    setClickedTask({
                      ...clickedTask,
                      dueDay: date.toISOString(),
                    })}
                  utcOffset={-420}
                />
              </div>


              <button type="submit">Edit Task</button>
            </form>
          </div>
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
                <li key={index} className="TaskCard" >
                  <div className="taskDetails">
                    <p className="taskTitle">{task.name}</p>
                    <p className="taskDesc">{task.description}</p>
                    <p className="taskStatus">{task.status}</p>
                    <p className="taskDue">{task.dueDay}</p>
                  </div>
                  <div className="optionsButtons">
                    <button style={{ borderRadius: "5px", height: "40px" }} onClick={() => handleDelete(task)}>Delete</button>
                    <button style={{ borderRadius: "5px", height: "40px" }} onClick={() => handleEdit(task.id)}>Edit</button>
                  </div>
                </li>
              ))}
            </ul>
        )
      }
    </div>
  );
}

export default TaskTracker;
