import axios from 'axios';
import React, { useEffect, useState } from 'react';
// import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { Container, Modal } from 'react-bootstrap';
import Login from './components/Login';
import CustomNavbar from './components/Navbar';
import TodoList from './components/TodoList';

const endpoint = process.env.REACT_APP_TODO_ENDPOINT;
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export function App() {
    // State
    const [user, setUser] = useState("");
    const [show, setShow] = useState(false);

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

    const onLogin = async (fdata) => {
        await axios.post(`${endpoint}/accounts/login/`, fdata, {})
        const uname = await getUser()
        if (uname) setShow(false);
        return getUser()
    }
    const onLogout = async () => {
        await axios.post(`${endpoint}/accounts/logout/`, {}, {})
        return getUser()
    }

    return (
        <Container fluid>
            <CustomNavbar user={user} onLogin={() => setShow(true)} onLogout={onLogout} />
            <LoginModal show={show} setShow={setShow} user={user} onLogin={onLogin} />
            <TodoList user={user}/>
            {/* <Login user={user} onUserChange={getUser} /> */}
        </Container>
    );
}

function LoginModal({ show, setShow, onLogin }) {
    const handleClose = () => setShow(false);

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Login</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Login onLogin={onLogin} />
            </Modal.Body>
        </Modal>
    )
}