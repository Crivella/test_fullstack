import { useEffect, useState } from 'react';
import { Button, Image } from 'react-bootstrap';
import './FlippableButton.css';


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default function FlippableButton({
    on, 
    offState, offVariant = 'outline-primary',
    onState, onVariant = 'primary',
    handleSync, handleAsync, 
    time = 500}) {
    const [persist, setPersist] = useState(false);
    const [_completed, setCompleted] = useState(on);

    useEffect(() => {
        setCompleted(on);
    }, [on]);

    const _handleUpdate = () => {
        setPersist(true);
        timeout(time/2).then(() => setCompleted(!on));
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

export function CompletedButton({item, handleUpdate}) {
    const { completed } = item || {};

    const handleAsync = () => {
        handleUpdate({id: item.id, completed: !completed});
    }

    return (
        <FlippableButton
            on={completed}
            offState='✗'
            onState='✓'
            onVariant='success'
            handleAsync={handleAsync}
            />
    )
}

export function FavoriteButton({item, handleUpdate}) {
    const { favorite } = item || {};

    const handleAsync = () => {
        handleUpdate({id: item.id, favorite: !favorite});
    }

    return (
        <FlippableButton
            on={favorite}
            offState={<Image src={`/todos/star.png`} width={16} height={16} />}
            onState={<Image src={`/todos/star-full.png`} width={16} height={16} />}
            handleAsync={handleAsync}
            />
    )
}