import { useState, useEffect } from 'react';
import loginServices from '../Services/loginServices';
import './LoginPage.css';

const LoginPage = () => {

    const [userName, setUserName] = useState();

    useEffect(() => {
        if (localStorage.getItem('loggedInUser') !== null) {
            window.location.href = '/tasktracker';
        }
    }, []);


    const validateUser = (e) => {
        e.preventDefault();
        loginServices.checkUser(userName)
            .then((response) => {
                localStorage.setItem('loggedInUser', userName);
                window.location.href = '/tasktracker';
            }).catch((err) => {
                var data = {
                    "userDetails": {
                        "username": userName
                    }
                }
                loginServices.addUser(data)
                    .then((response) => {
                        localStorage.setItem('loggedInUser', userName);
                        window.location.href = '/tasktracker';
                    })
                    .catch((err) => { console.log(err); });
            });
    }

    return (
        <div className='LoginDiv'>
            <h1>Login Page</h1>
            <p>
                (user will be created if it doesn't exist)
            </p>
            <form onSubmit={(e) => validateUser(e)} style={{ display: "block" }}>
                <input type="text" placeholder='Enter Username' onChange={(e) => setUserName(e.target.value)} />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginPage;