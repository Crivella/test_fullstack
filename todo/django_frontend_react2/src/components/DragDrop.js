import { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useDrag, useDrop } from 'react-dnd';
import './DragDrop.css';

export function ListItemDragDropFrame({
    children, 
    type, data, 
    onHover, onDrop, onCollect,
    placeHolder = <></>
}) {
    const [draggedDir, setDraggedDir] = useState(0);
    // const [dragged, setDragged] = useState(false);
    const [dropped, setDropped] = useState(false);

    const swipeRef = useRef(null);
    
    const [{ isDragging }, dragRef, dragPreviewRef] = useDrag(() => ({
        type: type,
        item: data,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [data]);

    const [{}, dropRef] = useDrop(() => ({
        accept: type,
        drop: (item, monitor) => {
            if (item.id === data.id) return;
            if (onDrop) onDrop(item, data, monitor);
            setDropped(true);
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
            if (draggedDir) setDraggedDir(0);
            return {}
        },
    }), [data]);

    useEffect(() => {
        if (dropped) {
            swipeRef.current.className = 'swipein'
            setDropped(false);
        }
    }, [dropped, swipeRef]);

    // useEffect(() => {
    //     if (isDragging && !dragged) {
    //         swipeRef.current.className = 'swipeout'
    //     }
    //     if (!isDragging && !dragged) {
    //         swipeRef.current.className = 'swipein'
    //     }
    //     setDragged(isDragging);
    // }, [isDragging, swipeRef]);

    // if (isDragging) return (<EmptyTodoItem ref={dragPreviewRef} />);
    if (isDragging) return (placeHolder);
    
    return (
        <Container ref={dropRef} fluid className='m-0 p-0' >
        <Container ref={swipeRef} fluid className='m-0 p-0' >
            {draggedDir === -1 ? placeHolder : null}
            <Container  ref={dragRef} fluid className='m-0 p-0' >
                {children}
            </Container>
            {draggedDir === 1 ? placeHolder : null}
        </Container>
        </Container>
    )
}