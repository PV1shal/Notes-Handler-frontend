import axios from 'axios';

class LoginServices {
    checkUser = (data) => {
        return axios.get(`https://lighthall-challenge2-backend.herokuapp.com/api/taskManager/users/${data}`);
    }

    addUser = (data) => {
        return axios.post(`https://lighthall-challenge2-backend.herokuapp.com/api/taskManager/users`, data);
    }
}

export default new LoginServices();