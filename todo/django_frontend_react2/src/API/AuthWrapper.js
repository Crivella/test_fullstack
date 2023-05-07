import axios from 'axios';
import { useEffect, useState } from 'react';
import PassPropsWrapper from '../components/Wrapper';

const endpoint = process.env.REACT_APP_AUTH_ENDPOINT;
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true


export default function APIAuthWrapper({ children }) {
    const [user, setUser] = useState("");

    useEffect(() => {updateUser()}, []);

    const updateUser = () => {
        return axios.get(`${endpoint}/get-user/`, {
            headers: { 'Content-Type': 'application/json' }
            })
            .then(({data}) => {setUser(data.username); return data.username})
            .catch((err) => console.log(err));
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
    }

    return (
        <PassPropsWrapper newProps={newProps}>
            {children}
        </PassPropsWrapper>
    )
}
