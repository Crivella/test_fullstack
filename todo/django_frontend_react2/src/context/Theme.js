import { createContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";

export const ThemeContext = createContext('dark');

export default function ThemeProvider({children, theme: _theme}) {
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
        <Container fluid className={`vh-100 overflow-auto bg-${theme} m-0 p-0`} data-bs-theme={theme}>
            <ThemeContext.Provider value={newProps}>
                {children}
            </ThemeContext.Provider>
        </Container>
    )
}