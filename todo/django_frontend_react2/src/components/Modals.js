import { useContext, useState } from "react";
import { Alert, Button, Container } from "react-bootstrap";
import { ModalFormWrapper } from "../commons/ModalWrapper";
import { LoginForm, PasswordResetForm, TodoForm } from "./Forms";

// import { useAuth } from "../hooks/useAuth";
import { AuthContext } from "../API/AuthWrapper";
import { ListContext } from '../API/ListWrapper';

export function LoginModal({ setShow, ...rest }) {
    const {login} = useContext(AuthContext);
    
    const handleSubmit = async (fdata) => {
        const res = await login(fdata);
        setShow(!res);
        return res;
    };

    return (
        <ModalFormWrapper header="Login" {...rest}>
            <LoginForm onSubmit={handleSubmit} />
        </ModalFormWrapper>
    )
}

export function AddEditModal({ formHeader, ...rest }) {
    const { todoAction: onSubmit } = useContext(ListContext);
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

export function DeleteModal({ setShow, ...rest }) {
    const {list, active, todoAction } = useContext(ListContext);

    const handleSubmit = async () => {
        if (active<=0) return false;
        const res = await todoAction(active);
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

export function UserProfileModal({ setShow, ...rest }) {
    const { user } = useContext(AuthContext);
    const { passwordChange } = useContext(AuthContext);

    const [showPasswordReset, setShowPasswordReset] = useState(false);

    const handleSubmit = async (fdata) => {
        const res = await passwordChange(fdata);
        setShow(!res);
        return res;
    };

    return (
        <ModalFormWrapper header="User Profile" {...rest}>
            <p>Username: {user}</p>
            <Container fluid className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
                <Button variant="secondary" onClick={() => setShowPasswordReset(true)}>Password Reset</Button>
            </Container>
            <Alert variant="warning" show={showPasswordReset}  onClose={() => setShowPasswordReset(false)} dismissible>
                <PasswordResetForm onSubmit={handleSubmit} />
            </ Alert>
        </ModalFormWrapper>
    )
}


