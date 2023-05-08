import { useState } from "react";
import { Container } from "react-bootstrap";
import PassPropsWrapper from "./Wrapper";

export default function ThemeWrapper(props) {
    const {children, theme: _theme, ...extras} = props;
    const [theme, setTheme] = useState(_theme || "dark"); 
    // const [textTheme, setTheme] = useState(_theme || "dark"); 


    const themeContrast1 = (theme === "light" ? "dark" : "light");
    const themeContrast2 = (theme === "primary" ? "white" : "primary");
    // const themeText = theme === "dark" ? "light" : "dark";
    // const themeContrastText = theme;

    const newProps = {
        ...extras,
        'theme': theme,
        'themeContrast1': themeContrast1,
        'themeContrast2': themeContrast2,
        'setTheme': setTheme,
    }

    return (
        <Container fluid className={`bg-${theme}`}>
            <PassPropsWrapper newProps={newProps}>
                {children}
            </PassPropsWrapper>
        </Container>
    )
}