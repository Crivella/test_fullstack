import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

const endpoint = process.env.REACT_APP_AUTH_ENDPOINT;
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export const AuthContext = createContext({});

export default function APIAuthProvider({children}) {
    const [user, setUser] = useState("");

    useEffect(() => {
        getCSRFToken() //Needed to get CSRF token first time app is run
        updateUser()
    }, []);

    // GET request to a valide rendered page by Django to get CSRF token
    // https://stackoverflow.com/a/75014511/7604434
    const getCSRFToken = () => {
        return axios.get(`${endpoint}/login/`, {})
            // .then((res) => console.log(res))
            .catch((err) => console.log(err));
    };

    const updateUser = () => {
        return axios.get(`${endpoint}/get-user/`, {
            headers: { 'Content-Type': 'application/json' }
            })
            .then(({data}) => {setUser(data.username); return data.username})
            .catch((err) => console.log(err));
    };

    const passwordChange = async (data) => {
        const res = await axios.post(`${endpoint}/password_change/`, data, {})
            .catch((err) => console.log(err));

        return res.data.includes('Password change successful');
    };

    const login = async (data) => {
        await axios.post(`${endpoint}/login/`, data, {})
            .catch((err) => console.log(err));
        return updateUser();
    };

    const logout = async () => {
        await axios.post(`${endpoint}/logout/`, {}, {})
            .catch((err) => console.log(err));
        return updateUser();
    };

    const newProps = {
        'user': user,
        'login': login,
        'logout': logout,
        'passwordChange': passwordChange,
    }

    return (
        <AuthContext.Provider value={newProps}>
            {children}
        </AuthContext.Provider>
    )
}
