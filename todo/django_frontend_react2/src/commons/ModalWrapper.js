import React from 'react';
import { Container, Modal } from "react-bootstrap";
import PassPropsWrapper from './Wrapper';


export function ModalFormWrapper({ children, show, setShow, onSubmit, header, ...rest }) {
    const {theme, themeContrast1, themeContrast2} = rest;
    
    const handleSubmit = (fdata) => {
        const res = onSubmit(fdata);
        setShow(!res);
    };
    
    const newProps = {
        ...rest,
        onSubmit: handleSubmit,
    }

    return (
        <Modal show={show} onHide={() => setShow(false)}>
            <Container fluid className={`bg-${theme} text-${themeContrast1}`}>
                <Modal.Header  closeButton>
                    <Modal.Title>{header}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <PassPropsWrapper newProps={newProps}>
                        {children}
                    </PassPropsWrapper>
                </Modal.Body>
            </Container>
        </Modal>
    )
}