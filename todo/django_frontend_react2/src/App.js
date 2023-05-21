import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import APIAuthWrapper from './API/AuthWrapper';
import APIListWrapper from './API/ListWrapper';
import './App.css';
// import FilterSortWrapper from './commons/FilterSortWrapper';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FilterSortWrapper from './API/FilterSortWrapper';
import KeyMapWrapper from './commons/KeyMapWrapper';
import PaginatorWrapper from './commons/PaginationWrapper';
import ThemeWrapper from './commons/ThemeWrapper';
import { AddButton, OrderFilterResetButton, TrashCan } from './components/ExtraButtons';
import { AddEditModal, DeleteModal, LoginModal, ModalWrapper, UserProfileModal } from './components/Modals';
import CustomNavbar from './components/Navbar';
import { PaginationToolbar } from './components/PaginationToolbar';
import TodoList from './components/TodoList';

export function App() {

    return (
        <ThemeWrapper theme='dark'>
        <DndProvider backend={HTML5Backend}>
        <KeyMapWrapper>
        <ModalWrapper>
        <APIAuthWrapper>
            <LoginModal />
            <UserProfileModal />
            <CustomNavbar />

            <FilterSortWrapper>
            <APIListWrapper size={64}>
                <AddEditModal />
                <DeleteModal />
                {/* <FilterSortWrapper> */}
                {/* <PaginatorWrapper size={32}> */}
                <PaginatorWrapper size={16}>
                {/* <PaginatorWrapper size={4}> */}
                {/* <PaginatorWrapper size={2}> */}
                        <TodoList />
                        <OrderFilterResetButton />
                    <PaginationToolbar />
                {/* </PaginatorWrapper> */}
                </PaginatorWrapper>
                {/* </PaginatorWrapper> */}
                {/* </PaginatorWrapper> */}
                {/* </FilterSortWrapper> */}
                <AddButton />
                <TrashCan />
            </APIListWrapper>
            </FilterSortWrapper>
        </APIAuthWrapper>
        </ModalWrapper>
        </KeyMapWrapper>
        </DndProvider>
        </ThemeWrapper>
    );
}
