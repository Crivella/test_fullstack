import { Button } from "react-bootstrap";
import { useDrop } from "react-dnd";
import { ItemTypes } from '../Constants';
import './ExtraButtons.css';

import { useContext } from "react";
import { TodoAPIContext } from "../Context/API";
import { FilterSortContext } from "../commons/FilterSortWrapper";
import { ThemeContext } from "../commons/ThemeWrapper";
import { ModalContext } from "./Modals";

export function AddButton() {
    const {setFormAction} = useContext(TodoAPIContext);
    const {themeContrast1} = useContext(ThemeContext);
    const {setShowTodo} = useContext(ModalContext);
    
    const onClick = () => {
        setFormAction('add');
        setShowTodo(true);
    }
    
    return (
        <Button className="round-button pos-br" variant="primary" onClick={onClick}>
            <span style={{paddingBottom: 10}} className={`text-${themeContrast1}`}>+</span>
        </Button>
    );
}

export function OrderFilterResetButton() {
    const {themeContrast1} = useContext(ThemeContext);
    const { onOrderFilterReset } = useContext(FilterSortContext);
    
    return (
        <Button className="round-button pos-tr" variant="primary" onClick={onOrderFilterReset}>
            <span style={{paddingBottom: 10}} className={`text-${themeContrast1}`}>⧩</span>
        </Button>
    );
}

export function SaveButton() {
    const {themeContrast1} = useContext(ThemeContext);
    const { flushItems } = useContext(TodoAPIContext);

    return (
        <Button className="round-button pos-tl" variant="primary" onClick={flushItems}>
            <span style={{paddingBottom: 10}} className={`text-${themeContrast1}`}>💾</span>
        </Button>
    );
}

export function TrashCan() {
    const {themeContrast1} = useContext(ThemeContext);
    const { setActive, setFormAction } = useContext(TodoAPIContext);
    const { setShowDelete } = useContext(ModalContext);
    const [{isOver}, dropRef] = useDrop(() => ({
        accept: [ItemTypes.CARD, ItemTypes.CardCompleted],
        drop: (item, monitor) => {
            setActive(item);
            setFormAction('delete');
            setShowDelete(true);
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