import { useState } from "react";
import { Alert } from "react-bootstrap";
import { InputText } from "./commons";

export default function Form({ fields, onSubmit }) {
    const [validated, setValidated] = useState(false);
    const [failed, setFailed] = useState(false);

    const getValidationClass = () => (validated && 'was-validated') || 'has-validation';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidated(true);

        const data = Object.fromEntries(fields.map((field) => [field.label, e.target.elements[field.label].value]));
        if (Object.values(data).some((value) => !value)) return;

        e.target.reset();
        setValidated(false);
        const res =  await onSubmit(data) 
        if (!res) setFailed(true);
    };

    return (
        <div>
            <Alert variant="danger" show={failed}  onClose={() => setFailed(false)} dismissible>
                Wrong username or password
            </Alert>
            <form className={'row g-3 ' + getValidationClass()} onSubmit={handleSubmit} noValidate>
                {fields.map((field, idx) => <InputText key={idx} label={field.label} required={field.required}/>
                    )}
                <div className='col-12'>
                    <button className='btn btn-primary' type="submit">Login</button>
                </div>
            </form>
        </div>
    );
}