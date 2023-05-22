import { useContext } from 'react';
import { Container } from 'react-bootstrap';
import { useDrag, useDrop } from 'react-dnd';
import { ThemeContext } from '../commons/ThemeWrapper';

export function DragDropFrame({
    children, 
    type, data, 
    onHover = () => 1, onDrop = () => 1,
    placeHolder = <></>
}) {
    const { theme } = useContext(ThemeContext);
    const [{ isDragging }, dragRef, dragPreviewRef] = useDrag(() => ({
        type: type,
        item: data,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [data]);

    const [{isOver}, dropRef] = useDrop(() => ({
        accept: type,
        drop: (item, monitor) => {
            if (item.id === data.id) return;
            onDrop(item, data);
        },
        hover: (item, monitor) => {
            onHover(item, data);
            // if (item.id === data.id) return;
            // if (! monitor.isOver({ shallow: true })) return;
            // const idx1 = list.findIndex(e => e.id === item.id);
            // const idx2 = list.findIndex(e => e.id === data.id);

            // if (idx1 > idx2) setIsOverTop(true);
            // else setIsOverBot(true);
        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    }), [data]);

    // if (isDragging) return (<EmptyTodoItem ref={dragPreviewRef} />);
    if (isDragging) return (placeHolder);
    
    return (
        <Container bg={theme} ref={dragRef} fluid className='m-0 p-0' >
            <Container bg={theme} ref={dropRef} fluid className='m-0 p-0' >
                {children}
            </Container>
        </Container>
    )
}