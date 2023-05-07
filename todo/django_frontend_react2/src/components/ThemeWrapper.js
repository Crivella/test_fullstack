import { useState } from "react";
import PassPropsWrapper from "./Wrapper";

export default function ThemeWrapper(props) {
    const [theme, setTheme] = useState("light"); 

    const {children, ...extras} = props;

    const newProps = {
        ...extras,
        'theme': theme,
        'setTheme': setTheme,
    }

    return (
        <PassPropsWrapper newProps={newProps}>
            {children}
        </PassPropsWrapper>
    )
}