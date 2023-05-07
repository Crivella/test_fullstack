import 'bootstrap/dist/css/bootstrap.css';
import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import APIAuthWrapper from './API/AuthWrapper';
import APIListWrapper from './API/ListWrapper';
import { LoginModal } from './components/Login';
import CustomNavbar from './components/Navbar';
import ThemeWrapper from './components/ThemeWrapper';
import TodoList from './components/TodoList';

export function App() {
    // State
    const [show, setShow] = useState(false);

    return (
        <Container fluid>
            <ThemeWrapper>
                <APIAuthWrapper>
                    <CustomNavbar login={() => setShow(true)} />
                    <LoginModal show={show} setShow={setShow} />
                    <APIListWrapper>
                        <TodoList/>
                    </APIListWrapper>
                </APIAuthWrapper>
            </ThemeWrapper>
        </Container>
    );
}
