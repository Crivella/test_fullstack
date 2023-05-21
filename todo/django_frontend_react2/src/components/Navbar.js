import { useContext } from "react";
import { Button, Container, Dropdown, DropdownButton, Form, Nav, Navbar } from "react-bootstrap";
import { ThemeContext } from "../commons/ThemeWrapper";

export default function CustomNavbar(props) {
    const {user, logout} = props;
    const {theme, themeContrast1, setTheme} = useContext(ThemeContext);
    const {setShowLogin, setShowUserProfile} = props;

    const getLoginLogout = () => {
        if (user) {
            return (
                <DropdownButton className="mx-1" id="navbar-dropdown" title={user} variant={theme}>
                    <Dropdown.Menu variant={theme}>
                        <Dropdown.Item variant={theme} onClick={() => setShowUserProfile(true)}>Edit Profile</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                </DropdownButton>
            );
        } else {
            return (
                <Button className="mx-1" variant={`outline-${themeContrast1}`} onClick={() => setShowLogin(true)}>Login</Button>
            );
        }
    };

    return (
        <Navbar bg={theme === 'dark' ? 'black' : 'secondary'} variant={theme} text={themeContrast1} sticky="top" className={`border border-success`}>
            <Container fluid className="d-flex justify-content-between">
                <Nav className="d-flex">
                    <Navbar.Brand className={`text-${themeContrast1}`} href="#home">Todo</Navbar.Brand>
                </Nav>
                <Form className="d-flex">
                    <Form.Check type="switch" checked={theme === 'dark'} onChange={(e) => {e.target.checked ? setTheme('dark') : setTheme('light')}} />
                    {getLoginLogout()}
                </Form>
            </Container>
        </Navbar>
    );
}
