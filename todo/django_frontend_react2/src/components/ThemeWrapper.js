import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import PassPropsWrapper from "../commons/Wrapper";

export default function ThemeWrapper(props) {
    const {children, theme: _theme, ...extras} = props;
    const [theme, setTheme] = useState(_theme || "dark"); 
    // const [textTheme, setTheme] = useState(_theme || "dark"); 

    useEffect(() => {
        setTheme(localStorage.getItem('theme') || "dark");
    }, []);


    const themeContrast1 = (theme === "light" ? "dark" : "light");
    const themeContrast2 = (theme === "primary" ? "white" : "primary");
    
    const _setTheme = (theme) => {
        localStorage.setItem('theme', theme);
        setTheme(theme);
    }

    const newProps = {
        ...extras,
        'theme': theme,
        'themeContrast1': themeContrast1,
        'themeContrast2': themeContrast2,
        'setTheme': _setTheme,
    }

    return (
        <Container fluid className={`vh-100 bg-${theme} overflow-auto`}>
            <PassPropsWrapper newProps={newProps}>
                {children}
            </PassPropsWrapper>
        </Container>
    )
}