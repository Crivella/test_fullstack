import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AuthWrapper from './API/AuthWrapper';
import { TodosAPIWrapper } from './API/TodoListWrapper2';
import './App.css';
import FilterSortWrapper from './commons/FilterSortWrapper';
import PaginatorWrapper from './commons/PaginationWrapper';
import ThemeWrapper from './commons/ThemeWrapper';
import { AddButton, OrderFilterResetButton, SaveButton, TrashCan } from './components/ExtraButtons';
import { AddEditModal, DeleteModal, LoginModal, ModalWrapper, UserProfileModal } from './components/Modals';
import CustomNavbar from './components/Navbar';
import TodoList from './components/TodoList';

export function App() {

    return (
        <ThemeWrapper theme='dark'>
        <DndProvider backend={HTML5Backend}>
        <ModalWrapper>
        <PaginatorWrapper size={16}>
        <AuthWrapper>
            <CustomNavbar />
            <LoginModal />
            <UserProfileModal />
            <FilterSortWrapper>
                <TodosAPIWrapper size={1024}>
                    <AddEditModal />
                    <DeleteModal />
                    <TodoList />
                    <AddButton />
                    <SaveButton />
                    <TrashCan />
                </TodosAPIWrapper>
                <OrderFilterResetButton />
            </FilterSortWrapper>
        </AuthWrapper>
        </PaginatorWrapper>
        </ModalWrapper>
        </DndProvider>
        </ThemeWrapper>
    );
}
