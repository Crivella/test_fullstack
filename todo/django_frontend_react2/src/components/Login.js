import axios from 'axios';
import React, { useRef, useState } from 'react';
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";

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
        setValidated(true);
        const form = e.currentTarget;
        if (form.checkValidity() === false) return;

        const fdata = new FormData();
        fdata.append('username', Username.current.value);
        fdata.append('password', Password.current.value);
        await axios.post(`${endpoint}/accounts/login/`, fdata, {})
            .then(onUserChange)
            .then((u) => {
                if (u) return setValidated(false);

                e.target.reset();
                setFailed(true);
            })
            .then(() => setValidated(false))
            .catch((e) => console.log(e));
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
        <Container className="pt-3 bg-danger">
            <Alert variant="danger" show={failed}  onClose={() => setFailed(false)} dismissible>
                Wrong username or password
            </Alert>
            <Form validated={validated} onSubmit={loginSubmit} noValidate>
                <Row className="g-3">
                    <Form.Group as={Col} className="col-md-4" controlId="formBasicUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="user" placeholder="Username" ref={Username} required />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid username.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} className="col-md-4" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" ref={Password} required />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid password.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Row>
            </Form>
        </Container>
    );
}