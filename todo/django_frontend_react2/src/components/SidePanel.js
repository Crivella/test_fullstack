import { Container } from "react-bootstrap";
import { useTheme } from "../context/Hooks";
import './SidePanel.scss';



export default function SidePanel() {
    const {theme, themeContrast1, ThemeSwitch} = useTheme();
    
    return (
        <Container 
            // fluid 
            className={`
                side-panel 
                d-flex flex-column 
                m-0 p-0 h-100 
                bg-${theme === 'dark' ? 'black' : 'secondary'}`
            }
            >
        </Container>
    )
}