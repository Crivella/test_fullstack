import axios from 'axios';
import React, { useRef, useState } from 'react';
import { Alert, Button, Col, Form, Row } from "react-bootstrap";

const endpoint = process.env.REACT_APP_TODO_ENDPOINT;
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true


export default function Login ({user, onUserChange}) {
    const [validated, setValidated] = useState(false);
    const [failed, setFailed] = useState(false);

    const Username = useRef();
    const Password = useRef();
    
    const loginSubmit = async (e) => {
        e.preventDefault();
        console.log('loginSubmit')
        console.log(e)

        setValidated(true);

        const uname = Username.current.value
        const pword = Password.current.value

        if (!uname) return;
        if (!pword) return;

        const fdata = new FormData();
        fdata.append('username', uname);
        fdata.append('password', pword);
        await axios.post(`${endpoint}/accounts/login/`, fdata, {})
            .catch((err) => console.log(err));

        onUserChange()
        if (!user) setFailed(true);
        e.target.reset();
        setValidated(false);
    };

    const logoutSubmit = async (e) => {
        console.log('logoutSubmit')
        console.log(e)
        e.preventDefault();
        await axios.post(`${endpoint}/accounts/logout/`, {}, {})
        onUserChange()
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
    
    return (
        <div className="container">
            <Alert variant="danger" show={failed}  onClose={() => setFailed(false)} dismissible>
                Wrong username or password
            </Alert>
            <Form validated={validated} onSubmit={loginSubmit}>
                <Row className="g-3">
                    <Form.Group as={Col} className="col-md-4" controlId="formBasicUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="user" placeholder="Username" ref={Username} required />
                    </Form.Group>
                    <Form.Group as={Col} className="col-md-4" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" ref={Password} required />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Row>
            </Form>
        </div>
    );
}