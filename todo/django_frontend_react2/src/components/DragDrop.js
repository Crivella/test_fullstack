import { useEffect, useState } from 'react';
import { Container, Image } from 'react-bootstrap';
import { useDrag, useDrop } from 'react-dnd';
import './DragDrop.css';

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function ListItemDragDropFrame({
    children, 
    type, data, 
    onHover, onDrop, onCollect,
    placeHolder = <></>
}) {
    const [draggedDir, setDraggedDir] = useState(0);
    const [dropped, setDropped] = useState(false);

    const [{ isDragging }, dragRef, dragPreviewRef] = useDrag(() => ({
        type: type,
        item: data,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            if (!monitor.didDrop()) return;
            setDropped(true);
        }
    }), [data]);

    const [{}, dropRef] = useDrop(() => ({
        accept: type,
        drop: (item, monitor) => {
            if (item.id === data.id) return;
            if (onDrop) onDrop(item, data, monitor);
            // setDropped(true);
        },
        hover: (item, monitor) => {
            if (item.id === data.id) return;
            if (onHover) onHover(item, data, monitor);
            const {x,y} = monitor.getDifferenceFromInitialOffset();
            setDraggedDir(Math.sign(y));
        },
        collect: monitor => {
            if (onCollect) onCollect(monitor);
            if (!!monitor.isOver()) return {};
            setDraggedDir(0);
            return {}
        },
    // Before it was working why?
    // Now had to add onDrop on the dependecies array
    // otherwise dispatch inside onDrop works on the old data
    }), [data, onDrop]);

    const [extraClass, setExtraClass] = useState('');

    useEffect(() => {
        if (dropped) {
            setExtraClass('swipein')
            setDropped(false);
            timeout(350).then(() => {setExtraClass('')});
        }
    }, [dropped]);

    const placeHolderExp = {
        ...placeHolder, 
        'props': {
            ...placeHolder.props, 
            'className': `${placeHolder.props.className} expand`
        }};

    const placeHolderComp = {
        ...placeHolder, 
        'props': {
            ...placeHolder.props, 
            'className': `${placeHolder.props.className} compress`
        }};


    if (isDragging) return (placeHolderComp);
    
    return (
        <Container ref={dropRef} fluid className={`m-0 p-0 d-flex ${extraClass}`} >
            <div ref={dragRef} className="drag-button d-flex flex-column justify-content-center">
                <Image className='my-auto' src="/todos/drag.png" width={32} height={32} />
            </div>
            <Container fluid className='m-0 p-0 flex-grow-1' >
                {draggedDir === -1 ? placeHolderExp : null}
                {children}
                {draggedDir === 1 ? placeHolderExp : null}
            </Container>
        </Container>
    )
}

