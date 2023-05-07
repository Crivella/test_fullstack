import { Navbar } from "react-bootstrap";

export default function CustomNavbar({ user, onUserChange }) {
    return (
        <Navbar bg="dark" variant="dark">
            <Navbar.Brand href="#home">Todo</Navbar.Brand>
        </Navbar>
    );
}