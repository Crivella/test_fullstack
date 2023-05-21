import { createContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";

const ThemeContext = createContext('dark');

export { ThemeContext };

export default function ThemeWrapper(props) {
    const {children, theme: _theme, ...extras} = props;
    const [theme, setTheme] = useState(_theme || localStorage.getItem('theme') || "dark"); 

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    const themeContrast1 = (theme === "light" ? "dark" : "light");
    const themeContrast2 = (theme === "primary" ? "white" : "primary");

    const newProps = {
        // ...extras,
        'theme': theme,
        'themeContrast1': themeContrast1,
        'themeContrast2': themeContrast2,
        'setTheme': setTheme,
    }

    return (
        <Container fluid className={`bg-${theme}`}>
            <ThemeContext.Provider value={newProps}>
                {children}
            </ThemeContext.Provider>
        </Container>
    )
}