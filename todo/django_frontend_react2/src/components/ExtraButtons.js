import { Button } from "react-bootstrap";
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