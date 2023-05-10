import { Button } from "react-bootstrap";
import './AddButton.css';

export function AddButton({themeContrast1, setShow, setFormAction}) {
    const onClick = () => {
        setFormAction('add');
        setShow(true);
    }
    
    return (
        <Button className="round-button" variant="primary" onClick={onClick}>
            <span style={{paddingBottom: 10}} className={`text-${themeContrast1}`}>+</span>
        </Button>
    );
}