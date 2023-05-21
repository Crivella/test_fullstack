import { createContext, useContext, useState } from "react";
import { Alert, Button, Container } from "react-bootstrap";
import { ModalFormWrapper } from "../commons/ModalWrapper";
import { LoginForm, PasswordResetForm, TodoForm } from "./Forms";

// import { useAuth } from "../hooks/useAuth";
import { AuthContext } from "../API/AuthWrapper";
import { ListContext } from '../API/TodoListWrapper';

export const ModalContext = createContext({});

export function ModalWrapper({children}) {
    const [showLogin, setShowLogin] = useState(false);
    const [showTodo, setShowTodo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);

    const newProps = {
        'showLogin': showLogin,
        'showTodo': showTodo,
        'showDelete': showDelete,
        'showUserProfile': showUserProfile,
        'setShowLogin': setShowLogin,
        'setShowTodo': setShowTodo,
        'setShowDelete': setShowDelete,
        'setShowUserProfile': setShowUserProfile,
    }

    return (
        <ModalContext.Provider value={newProps}>
            {children}
        </ModalContext.Provider>
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

export function AddEditModal({ formHeader }) {
    const { todoAction } = useContext(ListContext);
    const { showTodo: show, setShowTodo: setShow } = useContext(ModalContext);

    const newProps = {
        show: show,
        setShow: setShow,
        onSubmit: todoAction,
    }

    return (
        <ModalFormWrapper header={formHeader} {...newProps} >
            <TodoForm />
        </ModalFormWrapper>
    )
}

export function DeleteModal() {
    const {list, active, todoAction } = useContext(ListContext);
    const { showDelete: show, setShowDelete: setShow } = useContext(ModalContext);

    const handleSubmit = async () => {
        if (active<=0) return false;
        const res = await todoAction(active);
        setShow(!res);
        return res;
    } 

    return (
        <ModalFormWrapper header="Delete item?" show={show} setShow={setShow} >
            <Container>
                <p>Are you sure you want to delete this item?</p>
                <p>"{active > 0 ? list.find(e => e.id === active).title : ''}"</p>
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


