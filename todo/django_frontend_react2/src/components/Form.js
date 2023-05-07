import { useState } from "react";
import { InputText } from "./commons";

export default function Form({ fields, onSubmit }) {
    const [validated, setValidated] = useState(false);
    const [failed, setFailed] = useState(false);

    const getValidationClass = () => (validated && 'was-validated') || 'has-validation';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidated(true);

        const data = Object.fromEntries(fields.map((field) => [field.label, e.target.elements[field.label].value]));
        await onSubmit(data) ? setValidated(false) : setFailed(true);
    };

    return (
        <div>
            <form className={'row g-3 ' + getValidationClass()} onSubmit={handleSubmit} noValidate>
                {fields.map((field, idx) => <InputText key={idx} label={field.label} required={field.required}/>
                    )}
                <div className='col-12'>
                    <button className='btn btn-primary' type="submit">Login</button>
                </div>
            </form>
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                Login failed!
            </div>
        </div>
    );
}