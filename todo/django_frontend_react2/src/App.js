import 'bootstrap/dist/css/bootstrap.css';
import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import APIAuthWrapper from './API/AuthWrapper';
import APIListWrapper from './API/ListWrapper';
import { LoginModal } from './components/Login';
import CustomNavbar from './components/Navbar';
import TodoList from './components/TodoList';

export function App() {
    // State
    const [theme, setTheme] = useState("light"); // ["dark", "light"
    const [show, setShow] = useState(false);

    return (
        <Container fluid>
            <APIAuthWrapper>
                <CustomNavbar theme={theme} login={() => setShow(true)} />
                <LoginModal theme={theme} show={show} setShow={setShow} />
                <APIListWrapper>
                    <TodoList theme={theme}/>
                    <div> test</div>
                </APIListWrapper>
            </APIAuthWrapper>
        </Container>
    );
}
