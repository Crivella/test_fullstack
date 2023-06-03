import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';
import { AddButton, OrderFilterResetButton, TrashCan } from './components/ExtraButtons';
import { AddEditModal, DeleteModal, LoginModal, UserProfileModal } from './components/Modals';
import CustomNavbar from './components/Navbar';

import APIProvider from './API/Providers';
import TodoList from './components/TodoList';
import CommonProviders from './context/Providers';

export function App() {

    return (
        <CommonProviders >
        <DndProvider backend={HTML5Backend}>
        <APIProvider size={16}>
            <CustomNavbar />
            <LoginModal />
            <UserProfileModal />
            <AddEditModal />
            <DeleteModal />
            <TodoList />
            <AddButton />
            {/* <SaveButton /> */}
            <TrashCan />
            <OrderFilterResetButton />
        </APIProvider>
        </DndProvider>
        </CommonProviders>
    );
}
