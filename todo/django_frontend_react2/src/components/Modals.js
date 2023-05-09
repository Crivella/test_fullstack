import { ModalFormWrapper } from "../commons/ModalWrapper";
import LoginForm from "./Login";
import { TodoForm } from "./TodoForm";

export function LoginModal({  ...rest }) {
    const {setShow, login: onSubmit } = rest;
    
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

export function TodoFormModal({  formHeader, ...rest }) {
    const {setShow, todoAction: onSubmit } = rest;

    const handleSubmit = async (fdata) => {
        const res = await onSubmit(fdata);
        setShow(!res);
        return res;
    }

    return (
        <ModalFormWrapper header={formHeader} {...rest}>
            <TodoForm login={handleSubmit} />
        </ModalFormWrapper>
    )
}
