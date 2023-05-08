import React, { useRef, useState } from 'react';
import { Alert, Button, Col, Container, Form, Modal, Row } from "react-bootstrap";

export default function LoginForm ({ theme, login }) {
    const [validated, setValidated] = useState(false);
    const [failed, setFailed] = useState(false);

    const Username = useRef();
    const Password = useRef();

    const onSubmit = (e) => {
        e.preventDefault();
        setValidated(true);
        const form = e.currentTarget;
        if (form.checkValidity() === false) return;

        const fdata = new FormData();
        fdata.append('username', Username.current.value);
        fdata.append('password', Password.current.value);

        setValidated(false);
        const user = login(fdata);
        if (!user) setFailed(true);
    };
    
    return (
        <Container className={`pt-3 bg-${theme}`}>
            <Alert variant="danger" show={failed}  onClose={() => setFailed(false)} dismissible>
                Wrong username or password
            </Alert>
            <Form validated={validated} onSubmit={onSubmit} noValidate>
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

export function LoginModal({  show, setShow, login, ...rest }) {
    const {theme, themeContrast1, themeContrast2} = rest;
    
    const onLogin = (fdata) => {
        const user = login(fdata);
        setShow(!user);
    };


    return (
        <Modal show={show} onHide={() => setShow(false)}>
            <Container fluid className={`bg-${theme} text-${themeContrast1}`}>
                <Modal.Header  closeButton>
                    <Modal.Title>Login</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <LoginForm theme={theme} login={onLogin} />
                </Modal.Body>
            </Container>
        </Modal>
    )
}