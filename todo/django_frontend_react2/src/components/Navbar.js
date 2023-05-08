import { Button, Container, Form, Nav, Navbar } from "react-bootstrap";

export default function CustomNavbar(props) {
    const {user, login, logout} = props;
    const {theme, themeContrast1, setTheme} = props;

    const getLoginLogout = () => {
        if (user) {
            return (
                <>
                    <Button className="mx-1" variant={`outline-${themeContrast1}`} >{user}</Button>
                    <Button className="mx-1" variant={`outline-${themeContrast1}`} onClick={logout}>Logout</Button>
                </>
            );
        } else {
            return (
                <Button className="mx-1" variant={`outline-${themeContrast1}`} onClick={login}>Login</Button>
            );
        }
    };

    return (
        <Navbar style={{'background-color': 'var(--bs-navbar-color)'}} variant={theme} text={themeContrast1} sticky="top" className={`border border-success`}>
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
