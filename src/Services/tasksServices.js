import axios from "axios";

class TasksServices {
    getTaskByUserID = (username) => {
        return axios.get(
            `https://lighthall-challenge2-backend.herokuapp.com/api/taskManager/tasks/${username}`
        );
    };

    addTask = (data) => {
        return axios.post(
            `https://lighthall-challenge2-backend.herokuapp.com/api/taskManager/tasks`,
            data
        );
    };

    updateTask = (data) => {
        return axios.put(
            `https://lighthall-challenge2-backend.herokuapp.com/api/taskManager/tasks/${data.id}`,
            data
        );
    };

    deleteTask = (data) => {
        return axios.delete(
            `https://lighthall-challenge2-backend.herokuapp.com/api/taskManager/tasks/${data}`
        );
    };
}

export default new TasksServices();