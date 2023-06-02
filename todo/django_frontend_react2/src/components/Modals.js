import { useContext, useState } from "react";
import { Alert, Button, Container, Modal } from "react-bootstrap";
import { LoginForm, PasswordResetForm, TodoForm } from "./Forms";

import { AuthContext } from "../API/Auth";
import { TodoAPIContext } from '../API/Todos';
import { ModalContext, ThemeContext } from "../context/Contexts";

export function ModalFormWrapper({ children, show, setShow, onSubmit, header }) {
    const {theme, themeContrast1} = useContext(ThemeContext);
    
    const handleSubmit = async (fdata) => {
        const res = await onSubmit(fdata);
        setShow(!res);
        return res;
    };

    let form = {...children};
    form.props = {...form.props, onSubmit: handleSubmit}; 

    return (
        <Modal show={show} onHide={() => setShow(false)}>
            <Container fluid className={`bg-${theme} text-${themeContrast1}`}>
                <Modal.Header  closeButton>
                    <Modal.Title>{header}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {form}
                </Modal.Body>
            </Container>
        </Modal>
    )
}


export function LoginModal() {
    const {login} = useContext(AuthContext);
    const {showLogin: show, setShowLogin: setShow} = useContext(ModalContext);

    const newProps = {
        show: show,
        setShow: setShow,
        onSubmit: login,
    }

    return (
        <ModalFormWrapper header="Login" {...newProps} >
            <LoginForm />
        </ModalFormWrapper>
    )
}

export function AddEditModal() {
    const { todoAction, formAction } = useContext(TodoAPIContext);
    const { showTodo: show, setShowTodo: setShow } = useContext(ModalContext);

    const newProps = {
        show: show,
        setShow: setShow,
        onSubmit: todoAction,
    }

    return (
        <ModalFormWrapper header={formAction} {...newProps} >
            <TodoForm />
        </ModalFormWrapper>
    )
}

export function DeleteModal() {
    const { active, todoAction } = useContext(TodoAPIContext);
    const { showDelete: show, setShowDelete: setShow } = useContext(ModalContext);

    const handleSubmit = async () => {
        if (!active) return false;
        console.log(active);
        const res = await todoAction(active);
        setShow(!res);
        return res;
    } 

    return (
        <ModalFormWrapper header="Delete item?" show={show} setShow={setShow} >
            <Container>
                <p>Are you sure you want to delete this item?</p>
                <p>"{active ? active.title : ''}"</p>
                <Container fluid className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={() => setShow(false)}>NO</Button>
                    <Button variant="danger" onClick={handleSubmit}>YES</Button>
                </Container>
            </Container>
        </ModalFormWrapper>
    )
}

export function UserProfileModal() {
    const { user, passwordChange } = useContext(AuthContext);
    const { showUserProfile: show, setShowUserProfile: setShow } = useContext(ModalContext);


    const [showPasswordReset, setShowPasswordReset] = useState(false);

    const handleSubmit = async (fdata) => {
        const res = await passwordChange(fdata);
        setShow(!res);
        return res;
    };

    return (
        <ModalFormWrapper header="User Profile" show={show} setShow={setShow}>
            <Container>
                <p>Username: {user}</p>
                <Container fluid className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
                    <Button variant="secondary" onClick={() => setShowPasswordReset(true)}>Password Reset</Button>
                </Container>
                <Alert variant="warning" show={showPasswordReset}  onClose={() => setShowPasswordReset(false)} dismissible>
                    <PasswordResetForm onSubmit={handleSubmit} />
                </ Alert>
            </Container>
        </ModalFormWrapper>
    )
}


