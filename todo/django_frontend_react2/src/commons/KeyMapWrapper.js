import { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import PassPropsWrapper from "./Wrapper";

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
    
    const newProps = {
        ...rest,
        'keyMap': keyMap,
    }

    return (
        <Container fluid onKeyDown={onKeyDown} onKeyUp={onKeyUp} tabIndex={-1} ref={ref}>
        <PassPropsWrapper newProps={newProps}>
            {children}
        </PassPropsWrapper>
        </Container>
    )
}