import { useContext } from "react";
import { Dropdown, DropdownButton, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../API/Auth";
import { useTheme } from "../context/Hooks";
import { ModalContext } from "../context/Modal";
import './SideBar.css';



export default function CustomNavbar() {
    const {user} = useContext(AuthContext);
    const {theme, themeContrast1, ThemeSwitch} = useTheme();

    return (
        <Navbar 
        bg={theme === 'dark' ? 'black' : 'secondary'} 
        variant={theme} text={themeContrast1} 
        sticky="left" 
        className={`d-flex justify-content-between flex-column`}
        >
            <Nav className="d-flex flex-column">
                <Navbar.Brand className={`text-${themeContrast1}`}>
                    <Link to="/" className={`text-${themeContrast1}`}>Todo</Link>
                </Navbar.Brand>
                <GeneralNav />
                {user ? <LoggedInNav /> : <AnonNav />}
            </Nav>
            <Nav className="d-flex flex-column justify-content-end align-content-center">
                {ThemeSwitch}
                {/* <Form className="d-flex flex-column justify-content-center"> */}
                    {user ? <UserDropdown /> : <AnonDropdown />}
                {/* </Form> */}
            </Nav>
        </Navbar>
    );
}

const navs = [
    ['Home', '/'],
    ['Explore', '/explore'],
]

const userNavs = [
    ['My Lists', ''],
    ['Favorites', 'favorites'],
]

function GeneralNav() {
    const {theme, themeContrast1, ThemeSwitch} = useTheme();
    const {user, logout} = useContext(AuthContext);
    const {setShowUserProfile} = useContext(ModalContext);

    return (
        navs.map(([title, link], idx) => (
            <Nav className="my-1" key={idx}>
                <Link to={`${link}`} className={`text-${themeContrast1}`}>{title}</Link>
            </Nav>
        ))
    )
}



function LoggedInNav() {
    const {theme, themeContrast1, ThemeSwitch} = useTheme();
    const {user, logout} = useContext(AuthContext);
    const {setShowUserProfile} = useContext(ModalContext);

    return (
        userNavs.map(([title, link], idx) => (
            <Nav className="my-1" key={idx}>
                <Link to={`${user}/${link}`} className={`text-${themeContrast1}`}>{title}</Link>
            </Nav>
        ))
    )
}

function AnonNav() {
    const {theme, themeContrast1, ThemeSwitch} = useTheme();
    const {setShowLogin} = useContext(ModalContext);

    return (
        <>
        </>
    )
}


function AnonDropdown() {
    const {theme} = useTheme();
    const {setShowLogin} = useContext(ModalContext);

    return (
        <DropdownButton 
            className="mx-1"
            id="navbar-dropdown" 
            title='Sign In' 
            variant={theme}
            drop="up"
            >
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
        <DropdownButton 
            className="mx-1" 
            id="navbar-dropdown" 
            title={user} variant={theme}
            drop="up"
            >
            <Dropdown.Menu variant={theme}>
                <Dropdown.Item as={Link} to={`${user}`} variant={theme}>
                    My Lists
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item variant={theme} onClick={() => setShowUserProfile(true)}>Edit Profile</Dropdown.Item>
                <Dropdown.Item as={Link} to='/' onClick={logout}>
                    Logout
                </Dropdown.Item>
            </Dropdown.Menu>
        </DropdownButton>
    )
}

