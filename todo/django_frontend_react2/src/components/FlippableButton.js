import { useState } from 'react';
import { Button } from 'react-bootstrap';
import './FlippableButton.css';


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default function FlippableButton({
    completed, 
    offState, offVariant = 'outline-primary',
    onState, onVariant = 'primary',
    handleSync, handleAsync, 
    time = 500}) {
    const [persist, setPersist] = useState(false);
    const [_completed, setCompleted] = useState(completed);

    const _handleUpdate = () => {
        setPersist(true);
        timeout(time/2).then(() => setCompleted(!completed));
        if (handleAsync) timeout(time*2/3).then(() => handleAsync());
        if (handleSync) timeout(time).then(() => handleSync());
        timeout(time).then(() => setPersist(false));
    }

    return (
        <Button 
            onClick={_handleUpdate} 
            variant={ _completed ? onVariant : offVariant }
            className={`round-button-sm mx-2 ${persist ? 'flip' : ''}`}
            >
            {_completed  ? onState : offState}
        </Button>
    )
}