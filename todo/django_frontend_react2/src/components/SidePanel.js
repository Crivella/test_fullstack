import { useContext } from "react";
import { Container } from "react-bootstrap";
import { ActiveContext } from "../API/Active";
import { useTheme } from "../context/Hooks";
import './SidePanel.css';
import TodoDetails from "./TodoDetails";



export default function SidePanel({ user }) {
    const {theme, themeContrast1, ThemeSwitch} = useTheme();

    const { active } = useContext(ActiveContext);
    
    return (
        <Container 
            fluid 
            className={`
                side-panel 
                d-flex flex-column
                m-0 p-0
                bg-${theme === 'dark' ? 'black' : 'secondary'}`
            }
            >
                {active ? <TodoDetails id={active} user={user} /> : <></>}
        </Container>
    )
}