import { useContext } from "react";
import { Container, Dropdown, DropdownButton, Form, Nav, Navbar } from "react-bootstrap";
import { AuthContext } from "../API/Contexts";
import { ModalContext } from "../context/Contexts";
import { useTheme } from "../context/Hooks";

export default function CustomNavbar() {
    const {user} = useContext(AuthContext);
    const {theme, themeContrast1, ThemeSwitch} = useTheme();

    return (
        <Navbar bg={theme === 'dark' ? 'black' : 'secondary'} variant={theme} text={themeContrast1} sticky="top" className={`border border-success`}>
            <Container fluid className="d-flex justify-content-between">
                <Nav className="d-flex">
                    <Navbar.Brand className={`text-${themeContrast1}`} href="#home">Todo</Navbar.Brand>
                </Nav>
                <Form className="d-flex">
                    {ThemeSwitch}
                    {user ? <UserDropdown /> : <AnonDropdown />}
                </Form>
            </Container>
        </Navbar>
    );
}

function AnonDropdown() {
    const {theme} = useTheme();
    const {setShowLogin} = useContext(ModalContext);

    return (
        <DropdownButton className="mx-1" id="navbar-dropdown" title='Sign In' variant={theme}>
            <Dropdown.Menu variant={theme}>
                <Dropdown.Item variant={theme} onClick={() => 1}>Sign In</Dropdown.Item>
                <Dropdown.Item onClick={() => setShowLogin(true)}>Login</Dropdown.Item>
                {/* <Button className="mx-1" variant={`outline-${themeContrast1}`} onClick={() => setShowLogin(true)}>Login</Button> */}
            </Dropdown.Menu>
        </DropdownButton>
    )
}

function UserDropdown() {
    const {theme} = useTheme();
    const { user, logout } = useContext(AuthContext);
    const {setShowUserProfile} = useContext(ModalContext);

    return (
        <DropdownButton className="mx-1" id="navbar-dropdown" title={user} variant={theme}>
            <Dropdown.Menu variant={theme}>
                <Dropdown.Item variant={theme} onClick={() => setShowUserProfile(true)}>Edit Profile</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
        </DropdownButton>
    )
}