import { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PassPropsWrapper from "../commons/Wrapper";

export default function ThemeWrapper(props) {
    const {children, theme: _theme, ...extras} = props;
    const [theme, setTheme] = useState(_theme || "dark"); 
    // const [textTheme, setTheme] = useState(_theme || "dark"); 

    const [keyMap, setKeyMap] = useState(new Map());

    const ref = useRef(null);

    useEffect(() => {
        setTheme(localStorage.getItem('theme') || "dark");
        ref.current.focus();
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
        'keyMap': keyMap,
    }

    const onKeyDown = (e) => {
        if (e.repeat) return;
        const res = new Map(keyMap);
        res.set(e.key, 1);
        setKeyMap(res);
    };
    const onKeyUp = (e) => {
        const res = new Map(keyMap);
        res.delete(e.key);
        setKeyMap(res);
    };

    return (
        <Container fluid className={`vh-100 bg-${theme} overflow-auto`} onKeyDown={onKeyDown} onKeyUp={onKeyUp} tabIndex={-1} ref={ref}>
            <DndProvider backend={HTML5Backend}>
                <PassPropsWrapper newProps={newProps}>
                    {children}
                </PassPropsWrapper>
            </ DndProvider>
        </Container>
    )
}