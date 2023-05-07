import axios from 'axios';
import React, { useEffect, useState } from 'react';
// import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { Container } from 'react-bootstrap';
import Login from './components/Login';
import CustomNavbar from './components/Navbar';
import TodoList from './components/TodoList';

const endpoint = process.env.REACT_APP_TODO_ENDPOINT;

export function App() {
    // State
    const [user, setUser] = useState("");

    // Lifecycle
    useEffect(() => {
        getUser();
        // setUser(localStorage.getItem("user"));
    }, []);

    const getUser = () => {
        return axios.get(`${endpoint}/accounts/get-user/`, {})
            .then(({data}) => {setUser(data.username); return data.username})
            .catch((err) => console.log(err));
    };

    return (
        <Container fluid>
            <CustomNavbar user={user} onUserChange={getUser} />
            <TodoList user={user}/>
            <Login user={user} onUserChange={getUser} />
        </Container>
    );
}

