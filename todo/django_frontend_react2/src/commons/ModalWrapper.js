import React, { useContext } from 'react';
import { Container, Modal } from "react-bootstrap";

import { ThemeContext } from './ThemeWrapper';




export function ModalFormWrapper({ children, show, setShow, onSubmit, header }) {
    const {theme, themeContrast1} = useContext(ThemeContext);
    
    const handleSubmit = async (fdata) => {
        const res = await onSubmit(fdata);
        setShow(!res);
        return res;
    };

    let form = {...children};
    form.props = {...form.props, onSubmit: handleSubmit}; 

    return (
        <Modal show={show} onHide={() => setShow(false)}>
            <Container fluid className={`bg-${theme} text-${themeContrast1}`}>
                <Modal.Header  closeButton>
                    <Modal.Title>{header}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {form}
                </Modal.Body>
            </Container>
        </Modal>
    )
}