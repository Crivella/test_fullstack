import 'bootstrap/dist/css/bootstrap.css';
import React, { useState } from 'react';
import APIAuthWrapper from './API/AuthWrapper';
import APIListWrapper from './API/ListWrapper';
import './App.css';
import { AddEditModal, DeleteModal, LoginModal } from './components/Modals';
import CustomNavbar from './components/Navbar';
import ThemeWrapper from './components/ThemeWrapper';
import TodoList from './components/TodoList';

export function App() {
    // State
    const [showLogin, setShowLogin] = useState(false);
    const [showTodo, setShowTodo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);


    return (
        <ThemeWrapper theme='dark'>
            <APIAuthWrapper>
                <LoginModal show={showLogin} setShow={setShowLogin} />
                <APIListWrapper>
                    <AddEditModal show={showTodo} setShow={setShowTodo} />
                    <DeleteModal show={showDelete} setShow={setShowDelete} />
                    <CustomNavbar setShowLogin={setShowLogin}  setShowTodo={setShowTodo}/>
                    <TodoList setShowTodo={setShowTodo} setShowDelete={setShowDelete} />
                </APIListWrapper>
            </APIAuthWrapper>
        </ThemeWrapper>
    );
}
