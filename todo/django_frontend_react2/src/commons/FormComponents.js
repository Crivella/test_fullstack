import { Form } from "react-bootstrap";

export function FormText({type = 'text', label, value, onChange, fieldProps, ...rest}) {
    return (
        <Form.Group {...rest}>
            <Form.Label>{label}</Form.Label>
            <Form.Control type={type} value={value} onChange={(e) => onChange(e.target.value)} {...fieldProps} />
        </Form.Group>
    )
}

export function FormCheckbox({ label, value, onChange, fieldProps, ...rest}) {
    return (
        <Form.Group {...rest}>
            <Form.Label>{label}</Form.Label>
            <Form.Check type='checkbox' value={value}  onChange={(e) => onChange(e.target.checked)} {...fieldProps} />
        </Form.Group>
    )
}
