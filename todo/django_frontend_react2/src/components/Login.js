import axios from 'axios';
import React from 'react';
import Form from './Form';

const endpoint = process.env.REACT_APP_TODO_ENDPOINT;
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true


export default function Login ({user, onUserChange}) {
    const loginSubmit = async (data) => {
        console.log('loginSubmit')
        console.log(data)

        const fdata = new FormData();
        fdata.append('username', data.Username);
        fdata.append('password', data.Password);
        await axios.post(`${endpoint}/accounts/login/`, fdata, {})
            .catch((err) => console.log(err));

        onUserChange()
        return Boolean(user)
    };

    const logoutSubmit = async (data) => {
        console.log('logoutSubmit')
        console.log(data)
        // e.preventDefault();
        // await axios.post(`${endpoint}/accounts/logout/`, {}, {})
        // onUserChange()
    };

    if (user) {
        return (
            <div>
                <h1>Hello {user}</h1>
                <form onSubmit={logoutSubmit}>
                    <button type="submit">Logout</button>
                </form>
            </div>
        );
    }
    
    const fields = [
        {"label": "Username", "required": true},
        {"label": "Password", "required": true}
    ]
    
    return (
        <div>
            <Form fields={fields} onSubmit={loginSubmit} />
            {/* <form className={'row g-3 ' + getValidationClass()}>
                <InputText label="Username" text={Username} required={true}/>
                <InputText label="Password" text={Password} required={true}/>
                <div className='col-12'>
                    <button className='btn btn-primary' type="submit" onClick={loginSubmit}>Login</button>
                </div>
            </form> */}
        </div>
    );
}