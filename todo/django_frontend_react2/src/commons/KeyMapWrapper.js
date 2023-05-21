import { createContext, useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";

export const KeyMapContext = createContext(new Map());

export default function KeyMapWrapper({children, ...rest}) {
    const [keyMap, setKeyMap] = useState(new Map());

    const ref = useRef(null);

    useEffect(() => {
        ref.current.focus();
    }, []);

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
        <Container fluid onKeyDown={onKeyDown} onKeyUp={onKeyUp} tabIndex={-1} ref={ref}>
        <KeyMapContext.Provider value={keyMap}>
            {children}
        </KeyMapContext.Provider>
        </Container>
    )
}