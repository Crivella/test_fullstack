import 'bootstrap/dist/css/bootstrap.css';
import React, { useState } from 'react';
import APIAuthWrapper from './API/AuthWrapper';
import APIListWrapper from './API/ListWrapper';
import './App.css';
import FilterSortWrapper from './commons/FilterSortWrapper';
<<<<<<< HEAD
import { PaginatorWrapper } from './commons/PaginationWrapper';
=======
import { PaginationToolbar, PaginatorWrapper } from './commons/Pagination';
>>>>>>> 204d51dab8b37f5ab92e3989d4e94cbb10e4bf37
import ThemeWrapper from './commons/ThemeWrapper';
import { AddButton, OrderFilterResetButton, TrashCan } from './components/ExtraButtons';
import { AddEditModal, DeleteModal, LoginModal, UserProfileModal } from './components/Modals';
import CustomNavbar from './components/Navbar';
<<<<<<< HEAD
import { PaginationToolbar } from './components/PaginationToolbar';
=======
>>>>>>> 204d51dab8b37f5ab92e3989d4e94cbb10e4bf37
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
                <APIListWrapper size={64}>
                    <AddEditModal show={showTodo} setShow={setShowTodo} />
                    <DeleteModal show={showDelete} setShow={setShowDelete} />
                    <FilterSortWrapper>
                    {/* <PaginatorWrapper size={32}> */}
                    <PaginatorWrapper size={4}>
                    {/* <PaginatorWrapper size={2}> */}
                            <TodoList setShowTodo={setShowTodo} setShowDelete={setShowDelete} />
                            <OrderFilterResetButton />
                        <PaginationToolbar />
                    {/* </PaginatorWrapper> */}
                    </PaginatorWrapper>
                    {/* </PaginatorWrapper> */}
                    </FilterSortWrapper>
                    <AddButton setShow={setShowTodo} />
                    <TrashCan setShow={setShowDelete} />
                </APIListWrapper>
            </APIAuthWrapper>
        </ThemeWrapper>
    );
}
