import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LoginModal, UserProfileModal } from '../components/Modals';
import CustomNavbar from '../components/SideBar';

import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import APIProvider from '../API/Providers';
import CommonProviders from '../context/Providers';

export function Root() {
    return (
        <>
        <CommonProviders >
        <DndProvider backend={HTML5Backend}>
        <APIProvider size={8}>
            <LoginModal />
            <UserProfileModal />
            
            <Container fluid className="d-flex m-0 p-0 vh-100">
            <CustomNavbar />
            <Outlet />
            </Container>

        </APIProvider>
        </DndProvider>
        </CommonProviders>
        </>
    );
}
