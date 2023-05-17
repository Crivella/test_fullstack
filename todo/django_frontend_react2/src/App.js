import 'bootstrap/dist/css/bootstrap.css';
import React, { useState } from 'react';
import APIAuthWrapper from './API/AuthWrapper';
import APIListWrapper from './API/ListWrapper';
import './App.css';
import { AddButton, OrderFilterResetButton } from './components/ExtraButtons';
import FilterSortWrapper from './components/FilterSortWrapper';
import { AddEditModal, DeleteModal, LoginModal, UserProfileModal } from './components/Modals';
import CustomNavbar from './components/Navbar';
import ThemeWrapper from './components/ThemeWrapper';
import TodoList from './components/TodoList';

export function App() {
    // State
    const [showLogin, setShowLogin] = useState(false);
    const [showTodo, setShowTodo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);

    const setShowModals = {
        'setShowLogin': setShowLogin,
        'setShowTodo': setShowTodo,
        'setShowDelete': setShowDelete,
        'setShowUserProfile': setShowUserProfile,
    }


    return (
        <ThemeWrapper theme='dark'>
            <APIAuthWrapper>
                <LoginModal show={showLogin} setShow={setShowLogin} />
                <UserProfileModal show={showUserProfile} setShow={setShowUserProfile} />
                <CustomNavbar {...setShowModals} />
                <APIListWrapper>
                    <AddEditModal show={showTodo} setShow={setShowTodo} />
                    <DeleteModal show={showDelete} setShow={setShowDelete} />
                    <FilterSortWrapper>
                        <TodoList setShowTodo={setShowTodo} setShowDelete={setShowDelete} />
                        <OrderFilterResetButton />
                    </FilterSortWrapper>
                    <AddButton setShow={setShowTodo} />
                </APIListWrapper>
            </APIAuthWrapper>
        </ThemeWrapper>
    );
}
