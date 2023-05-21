import { Button } from "react-bootstrap";
import { useDrop } from "react-dnd";
import { ItemTypes } from '../Constants';
import './ExtraButtons.css';

import { useContext } from "react";
import { ThemeContext } from "../commons/ThemeWrapper";

export function AddButton({setShow, setFormAction}) {
    const {themeContrast1} = useContext(ThemeContext);
    const onClick = () => {
        setFormAction('add');
        setShow(true);
    }
    
    return (
        <Button className="round-button pos-br" variant="primary" onClick={onClick}>
            <span style={{paddingBottom: 10}} className={`text-${themeContrast1}`}>+</span>
        </Button>
    );
}

export function OrderFilterResetButton({onOrderFilterReset}) {
    const {themeContrast1} = useContext(ThemeContext);
    const onClick = () => {
        onOrderFilterReset();
    }
    
    return (
        <Button className="round-button pos-tr" variant="primary" onClick={onClick}>
            <span style={{paddingBottom: 10}} className={`text-${themeContrast1}`}>⧩</span>
        </Button>
    );
}

export function TrashCan({setShow, setActive, setFormAction}) {
    const {themeContrast1} = useContext(ThemeContext);
    const [{isOver}, dropRef] = useDrop(() => ({
        accept: ItemTypes.CARD,
        drop: (item, monitor) => {
            setActive(item.id);
            setFormAction('delete');
            setShow(true);
        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    }), []);

    return (
        <Button ref={dropRef} className="round-button pos-bl" variant="primary">
            <span style={{paddingBottom: 10}} className={`text-${themeContrast1}`}>🗑</span>
        </Button>
    );
}