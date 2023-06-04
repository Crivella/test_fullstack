import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LoginModal, UserProfileModal } from '../components/Modals';
import CustomNavbar from '../components/Navbar';

import { Outlet } from 'react-router-dom';
import APIProvider from '../API/Providers';
import CommonProviders from '../context/Providers';

export function Root() {
    return (
        <>
        <CommonProviders >
        <DndProvider backend={HTML5Backend}>
        <APIProvider size={8}>
            <CustomNavbar />
            <LoginModal />
            <UserProfileModal />
            
            <Outlet />

        </APIProvider>
        </DndProvider>
        </CommonProviders>
        </>
    );
}
