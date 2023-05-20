import { useState } from "react";
import { Alert, Button, Container } from "react-bootstrap";
import { ModalFormWrapper } from "../commons/ModalWrapper";
import { LoginForm, PasswordResetForm, TodoForm } from "./Forms";

export function LoginModal({  login: onSubmit, ...rest }) {
    const {setShow } = rest;
    
    const handleSubmit = async (fdata) => {
        const res = await onSubmit(fdata);
        setShow(!res);
        return res;
    };

    return (
        <ModalFormWrapper header="Login" {...rest}>
            <LoginForm login={handleSubmit} />
        </ModalFormWrapper>
    )
}

export function AddEditModal({ formHeader, todoAction: onSubmit, ...rest }) {
    const { setShow } = rest;
    
    const handleSubmit = async (fdata) => {
        const res = await onSubmit(fdata);
        setShow(!res);
        return res;
    }

    return (
        <ModalFormWrapper header={formHeader} {...rest}>
            <TodoForm onSubmit={handleSubmit} />
        </ModalFormWrapper>
    )
}

export function DeleteModal({ list, active, ...rest }) {
    const {setShow, todoAction: onSubmit } = rest;

    const handleSubmit = async () => {
        if (active<=0) return false;
        const res = await onSubmit(active);
        setShow(!res);
        return res;
    } 

    return (
        <ModalFormWrapper header="Delete item?" {...rest}>
            <p>Are you sure you want to delete this item?</p>
            <p>"{active > 0 ? list.find(e => e.id === active).title : ''}"</p>
            <Container fluid className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => setShow(false)}>NO</Button>
                <Button variant="danger" onClick={handleSubmit}>YES</Button>
            </Container>
        </ModalFormWrapper>
    )
}

export function UserProfileModal({ user, ...rest }) {
    const { setShow } = rest;
    const { passwordChange } = rest;

    const [showPasswordReset, setShowPasswordReset] = useState(false);

    return (
        <ModalFormWrapper header="User Profile" {...rest}>
            <p>Username: {user}</p>
            <Container fluid className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
                <Button variant="secondary" onClick={() => setShowPasswordReset(true)}>Password Reset</Button>
            </Container>
            <Alert variant="warning" show={showPasswordReset}  onClose={() => setShowPasswordReset(false)} dismissible>
                <PasswordResetForm onSubmit={passwordChange} setShow={setShowPasswordReset} />
            </ Alert>
        </ModalFormWrapper>
    )
}


