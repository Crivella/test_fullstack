import { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { FormCheckbox, FormText } from './FormComponents';


export default function ValidatedForm ({
    formLayout=[], formFields={}, formErrorMessage = 'Form submission failed',
    onSubmit, 
    dataFormat = 'json', populate = {}, 
    ...rest
}) {
    const [data, setData]  = useState({});

    const [validated, setValidated] = useState(false);
    const [failed, setFailed] = useState(false);

    const {theme, themeContrast1, themeContrast2} = rest;

    useEffect(() => {
        Object.keys(formFields).forEach((e) => data[e] = null);
        if (populate) setData({...data, ...populate});
    }, []);

    const getData = () => {
        switch (dataFormat) {
            case 'json':
                return JSON.stringify(data);
            case 'form':
                const fdata = new FormData();
                for (const [key, value] of Object.entries(data)) {
                    fdata.append(key, value);
                }
                return fdata;
            
            default:
                throw new Error(`No action for data format ${dataFormat}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidated(true);
        const form = e.currentTarget;
        if (form.checkValidity() === false) return;

        const fdata = getData();

        setValidated(false);
        const res = await onSubmit(fdata);
        if (!res) setFailed(true);
    };

    const getLayoutItem = (item, csize) => {
        const fitem = formFields[item];

        const props = {
            'as': Col,
            'className': `col-md-${csize}`,
            'controlId': `formBasic${item}`,
            'label': item,
            'onChange': (e) => data[item] = e,
            'value': data[item],
            'fieldProps': fitem
        }

        switch (fitem.type) {
            case 'text':
            case 'user':
            case 'password':
            case 'email':
                return <FormText {...props}/>;
            case 'checkbox':
            case 'switch':
                return <FormCheckbox {...props}/>;
            default:
                throw new Error(`Type '${fitem.type}' not implemented`);
        }
    }; 

    const solveLayout = (layout) => {
        return (layout.map((e) => (
            <Row className="g-3">
                {e.map((f) => {
                    const csize = Math.floor(12 / e.length);
                    return getLayoutItem(f, csize);
                    })}
            </Row>
        )))
        };

    return (
        <Container className={`pt-3 bg-${theme} text-${themeContrast1}`}>
            <Alert variant="danger" show={failed}  onClose={() => setFailed(false)} dismissible>
                {formErrorMessage}
            </Alert>
            <Form validated={validated} onSubmit={handleSubmit} noValidate>
                {solveLayout(formLayout)}
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </Container>
        )
    }

