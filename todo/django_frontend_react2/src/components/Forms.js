import { useContext, useEffect, useRef, useState } from "react";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";

import { ListContext } from "../API/TodoListWrapper";
import { ThemeContext } from "../commons/ThemeWrapper";

export function TodoForm({onSubmit}) {
    const {list, formAction, active} = useContext(ListContext);
    const {theme} = useContext(ThemeContext);
    
    const [validated, setValidated] = useState(false);
    const [failed, setFailed] = useState(false);
    
    const title = useRef();
    const desc = useRef();
    const priv = useRef();

    useEffect(() => {
        if (!active || formAction === 'add') return;
        const data = list.find((item) => item.id === active);
        title.current.value = data.title;
        desc.current.value = data.description;
        priv.current.checked = data.private;
    }, [list, active, formAction]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidated(true);
        const form = e.currentTarget;
        if (form.checkValidity() === false) return false;
        
        const data = {
            id: active,
            title: title.current.value,
            description: desc.current.value,
            private: priv.current.checked,
        }

        setValidated(false);
        const res = await onSubmit(data);
        if (!res) {
            setFailed(true);
            return false
        }

        return true;
    };

    return (
        <Container className={`pt-3 bg-${theme}`}>
            <Alert variant="danger" show={failed}  onClose={() => setFailed(false)} dismissible>
                Failed submission
            </Alert>
            <Form validated={validated} onSubmit={handleSubmit} noValidate>
                <Row className="g-3">
                    <Form.Group as={Col} className="col-md-10" controlId="formBasicTitle">
                        <Form.Label>Title</Form.Label>
                        <Form.Control type="user" placeholder="Title" ref={title} required />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid title.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} className="col-md-2" controlId="formBasicPriv">
                        <Form.Label>Private</Form.Label>
                        <Form.Check type="checkbox" ref={priv} />
                    </Form.Group>
                    <Form.Group as={Col} className="col-md-12" controlId="formBasicDesc">
                        <Form.Label>Description</Form.Label>
                        <Form.Control type="text" placeholder="Description" ref={desc} />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Row>
            </Form>
        </Container>
    );
}

export function LoginForm ({ onSubmit }) {
    const {theme} = useContext(ThemeContext);

    const [validated, setValidated] = useState(false);
    const [failed, setFailed] = useState(false);

    const Username = useRef();
    const Password = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidated(true);
        const form = e.currentTarget;
        if (form.checkValidity() === false) return;

        const fdata = new FormData();
        fdata.append('username', Username.current.value);
        fdata.append('password', Password.current.value);

        setValidated(false);
        const user = await onSubmit(fdata);
        if (!user) setFailed(true);
    };
    
    return (
        <Container className={`pt-3 bg-${theme}`}>
            <Alert variant="danger" show={failed}  onClose={() => setFailed(false)} dismissible>
                Wrong username or password
            </Alert>
            <Form validated={validated} onSubmit={handleSubmit} noValidate>
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

export function PasswordResetForm({ onSubmit }) {
    const {theme} = useContext(ThemeContext);

    const [validated, setValidated] = useState(false);
    const [failed, setFailed] = useState(false);
    
    const oldPassword = useRef();
    const NewPassword1 = useRef();
    const NewPassword2 = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidated(true);
        const form = e.currentTarget;
        if (form.checkValidity() === false) return false;
        
        const fdata = new FormData();
        fdata.append('old_password', oldPassword.current.value);
        fdata.append('new_password1', NewPassword1.current.value);
        fdata.append('new_password2', NewPassword2.current.value);

        setValidated(false);
        const res = await onSubmit(fdata);
        setFailed(!res);

        return Boolean(res);
    };

    return (
        <Container className={`pt-3 bg-${theme}`}>
            <Alert variant="danger" show={failed}  onClose={() => setFailed(false)} dismissible>
                Failed submission
            </Alert>
            <Form validated={validated} onSubmit={handleSubmit} noValidate>
                <Row className="g-3">
                    <Form.Group as={Col} className="col-md-10" controlId="formBasicPassword">
                        <Form.Label>Old password:</Form.Label>
                        <Form.Control type="password" placeholder="old password" ref={oldPassword} required />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid password.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} className="col-md-10" controlId="formBasicNewPassword1">
                        <Form.Label>New password</Form.Label>
                        <Form.Control type="password" ref={NewPassword1} required />
                    </Form.Group>
                    <Form.Group as={Col} className="col-md-10" controlId="formBasicNewPassword2">
                        <Form.Label>New password confirmation</Form.Label>
                        <Form.Control type="password" ref={NewPassword2} required />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Row>
            </Form>
        </Container>
    );
}