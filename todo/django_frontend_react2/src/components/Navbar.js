import { Button, Container, Nav, Navbar } from "react-bootstrap";

export default function CustomNavbar(props) {
    const {user, login, logout} = props;
    const {theme, themeContrast1, themeContrast2} = props;

    const getLoginLogout = () => {
        if (user) {
            return (
                <Nav>
                    <Button className="mx-1" variant={`outline-${themeContrast1}`} >{user}</Button>
                    <Button className="mx-1" variant={`outline-${themeContrast1}`} onClick={logout}>Logout</Button>
                </Nav>
            );
        } else {
            return (
                <Nav>
                    <Button className="mx-1" variant={`outline-${themeContrast1}`} onClick={login}>Login</Button>
                </Nav>
            );
        }
    };
            
    return (
        <Navbar bg={theme} variant={theme} text={themeContrast1} sticky="top" className="border border-success">
            <Container fluid className="justify-content-between">
                <Navbar.Brand className={`text-${themeContrast1}`} href="#home">Todo</Navbar.Brand>
                {getLoginLogout()}
            </Container>
        </Navbar>
    );
}
