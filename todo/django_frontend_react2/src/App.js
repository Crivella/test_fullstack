import axios from 'axios';
import React, { useEffect, useState } from 'react';
// import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { Container, Modal } from 'react-bootstrap';
import LoginForm from './components/Login';
import CustomNavbar from './components/Navbar';
import TodoList from './components/TodoList';

const endpoint = process.env.REACT_APP_TODO_ENDPOINT;
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export function App() {
    // State
    const [theme, setTheme] = useState("light"); // ["dark", "light"
    const [user, setUser] = useState("");
    const [show, setShow] = useState(false);
    const [todos, setTodos] = useState([]);

    // Lifecycle
    useEffect(() => {
        getUser();
        refreshData();
    }, []);

    const refreshData = () => {
        axios.get(`${endpoint}/api/todo/`, {
            headers: { 'Content-Type': 'application/json' }
        }).then(({data}) => setTodos(data));
    };

    const getUser = () => {
        return axios.get(`${endpoint}/accounts/get-user/`, {})
            .then(({data}) => {setUser(data.username); return data.username})
            .catch((err) => console.log(err));
    };

    const onLogin = async (fdata) => {
        await axios.post(`${endpoint}/accounts/login/`, fdata, {})
        const uname = await getUser()
        if (uname) {setShow(false); refreshData()};
        return getUser()
    }
    const onLogout = async () => {
        await axios.post(`${endpoint}/accounts/logout/`, {}, {})
        refreshData();
        return getUser()
    }

    const updateTodo = (todo, e) => {
        axios.patch(`${endpoint}/api/todo/` + todo.id + "/", 
            {...todo, completed: e.target.checked}
        )
            .then(() => todo.completed = !todo.completed)
            .then(() => setTodos([...todos]))
            .catch((e) => console.log('Cant edit todo while not logged in!'));
    }

    return (
        <Container fluid>
            <CustomNavbar theme={theme} user={user} onLogin={() => setShow(true)} onLogout={onLogout} />
            <LoginModal theme={theme} show={show} setShow={setShow} user={user} onLogin={onLogin} />
            <TodoList theme={theme} todos={todos} updateTodo={updateTodo}/>
        </Container>
    );
}

function LoginModal({ theme, show, setShow, onLogin }) {
    const handleClose = () => setShow(false);

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Login</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <LoginForm theme={theme} onLogin={onLogin} />
            </Modal.Body>
        </Modal>
    )
}