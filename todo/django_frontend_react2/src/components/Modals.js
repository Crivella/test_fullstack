import { Button, Container } from "react-bootstrap";
import { ModalFormWrapper } from "../commons/ModalWrapper";
import LoginForm from "./Login";
import { TodoForm } from "./TodoForm";

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

export function DeleteModal({ active, ...rest }) {
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
            <Container fluid className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => setShow(false)}>NO</Button>
                <Button variant="danger" onClick={handleSubmit}>YES</Button>
            </Container>
        </ModalFormWrapper>
    )
}
