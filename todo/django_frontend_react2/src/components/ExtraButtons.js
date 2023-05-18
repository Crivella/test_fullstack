import { Button } from "react-bootstrap";
import { useDrop } from "react-dnd";
import { ItemTypes } from '../Constants';
import './ExtraButtons.css';

export function AddButton({themeContrast1, setShow, setFormAction}) {
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

export function OrderFilterResetButton({themeContrast1, onOrderFilterReset}) {
    const onClick = () => {
        onOrderFilterReset();
    }
    
    return (
        <Button className="round-button pos-tr" variant="primary" onClick={onClick}>
            <span style={{paddingBottom: 10}} className={`text-${themeContrast1}`}>⧩</span>
        </Button>
    );
}

export function TrashCan({themeContrast1, setShow, setActive, setFormAction}) {
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