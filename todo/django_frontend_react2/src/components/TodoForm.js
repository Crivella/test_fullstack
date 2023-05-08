import { useEffect, useRef, useState } from "react";
import { Alert, Button, Col, Container, Form, Modal, Row } from "react-bootstrap";


function TodoForm({onSubmit, theme, list, active}) {
    const [validated, setValidated] = useState(false);
    const [failed, setFailed] = useState(false);
    
    const title = useRef();
    const desc = useRef();
    const priv = useRef();

    useEffect(() => {
        if (!active) return;
        const data = list.find((item) => item.id === active);
        title.current.value = data.title;
        desc.current.value = data.description;
        priv.current.checked = data.private;
    }, [list, active]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidated(true);
        const form = e.currentTarget;
        if (form.checkValidity() === false) return false;
        
        const data = {
            id: active,
            title: title.current.value,
            description: desc.current.value,
            private: priv.current.checked,
        }

        setValidated(false);
        const res = await onSubmit(data);
        if (!res) {
            setFailed(true);
            console.log('Failed');
            return false
        }

        return true;
    };

    return (
        <Container className={`pt-3 bg-${theme}`}>
            <Alert variant="danger" show={failed}  onClose={() => setFailed(false)} dismissible>
                Failed submission
            </Alert>
            <Form validated={validated} onSubmit={handleSubmit} noValidate>
                <Row className="g-3">
                    <Form.Group as={Col} className="col-md-10" controlId="formBasicTitle">
                        <Form.Label>Title</Form.Label>
                        <Form.Control type="user" placeholder="Title" ref={title} required />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid title.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} className="col-md-2" controlId="formBasicPriv">
                        <Form.Label>Private</Form.Label>
                        <Form.Check type="checkbox" ref={priv} />
                    </Form.Group>
                    <Form.Group as={Col} className="col-md-12" controlId="formBasicDesc">
                        <Form.Label>Description</Form.Label>
                        <Form.Control type="text" placeholder="Description" ref={desc} />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Row>
            </Form>
        </Container>
    );
}

export function TodoFormModal({show, setShow, formHeader, onSubmit, ...rest}) {
    const {theme, themeContrast1, themeContrast2} = rest;

    const handleSubmit = async (fdata) => {
        const res = await onSubmit(fdata);
        console.log('TODOFORMMODAL');
        console.log(res);
        setShow(!res);
    }
    return (
        <Modal show={show} onHide={() => setShow(false)}>
             <Container fluid className={`bg-${theme} text-${themeContrast1}`}>
                <Modal.Header>
                    <Modal.Title>{formHeader}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TodoForm onSubmit={handleSubmit} {...rest}/>
                </Modal.Body>
             </Container>
        </Modal>
    )
}