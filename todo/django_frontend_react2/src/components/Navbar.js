import { Button, Container, Nav, Navbar } from "react-bootstrap";

export default function CustomNavbar({ user, login, logout }) {
    const getLoginLogout = () => {
        if (user) {
            return (
                <Nav>
                    <Button className="mx-1" variant="outline-light" >{user}</Button>
                    <Button className="mx-1" variant="outline-light" onClick={logout}>Logout</Button>
                </Nav>
            );
        } else {
            return (
                <Nav>
                    <Button className="mx-1" variant="outline-light" onClick={login}>Login</Button>
                </Nav>
            );
        }
    };
            
    return (
        <Navbar bg="dark" variant="dark" sticky="top">
            <Container fluid className="justify-content-between">
                <Navbar.Brand href="#home">Todo</Navbar.Brand>
                {getLoginLogout()}
            </Container>
        </Navbar>
    );
}
