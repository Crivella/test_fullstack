import { useContext } from "react";
import { Dropdown, DropdownButton, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../API/Auth";
import { useTheme } from "../context/Hooks";
import { ModalContext } from "../context/Modal";
import './SideBar.scss';



export default function CustomNavbar() {
    const {user} = useContext(AuthContext);
    const {theme, themeContrast1, ThemeSwitch} = useTheme();

    return (
        <div className={`
        m-0 p-0
        d-flex flex-column flex-grow-1
        bg-${theme === 'dark' ? 'black' : 'secondary'}
        `}>
            
        <Navbar 
        variant={theme} text={themeContrast1} 
        sticky="left" 
        className={`d-flex flex-column justify-content-between side-navbar`}
        >
            <Nav className="d-flex flex-column">
                <Navbar.Brand className={`text-${themeContrast1}`}>
                    <Link to="/" className={`text-${themeContrast1}`}>Todo</Link>
                </Navbar.Brand>
                <GeneralNav />
                {user ? <LoggedInNav /> :  <></>}
            </Nav>
            <Nav className="d-flex flex-column justify-content-end align-content-center">
                {ThemeSwitch({className: 'mx-auto my-2'})}
                {user ? <UserDropdown /> : <AnonDropdown />}
            </Nav>
        </Navbar>
        </div>
    );
}

const navs = [
    ['⌂', 'Home', '/'],
    ['🔍︎', 'Explore', '/explore'],
]

function GeneralNav() {
    const {themeContrast1 } = useTheme();

    return (
        navs.map(([symbol, title, link], idx) => (
            <Nav className="my-1" key={idx}>
                
                <Link to={`${link}`} className={`text-${themeContrast1}`}>
                    <span className={`text-${themeContrast1} symbol`}>{symbol}</span>
                    {title}
                </Link>
            </Nav>
        ))
    )
}

const userNavs = [
    ['🕮', 'My Lists', ''],
    ['☆', 'Favorites', 'favorites'],
]

function LoggedInNav() {
    const { themeContrast1 } = useTheme();
    const { user } = useContext(AuthContext);

    return (
        userNavs.map(([symbol, title, link], idx) => (
            <Nav className="my-1" key={idx}>
                <Link to={`${user}/${link}`} className={`text-${themeContrast1}`}>
                    <span className={`text-${themeContrast1} symbol`}>{symbol}</span>
                    {title}
                </Link>
            </Nav>
        ))
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

