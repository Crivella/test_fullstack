import { useContext } from 'react';
import { Alert, Button, Card, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { useDrag, useDrop } from 'react-dnd';
import { TodoAPIContext } from '../API/TodoListWrapper';
import { ItemTypes } from '../Constants';
import { ThemeContext } from '../commons/ThemeWrapper';
import { FilterSortHeader } from './FilterSort';
import { ModalContext } from './Modals';
import './TodoList.css';

// const ColLayout = [{'sm': 3, 'md':2}, {'sm': 7, 'md':8}, {'sm': 2}]
const ColLayout = [{'sm': 10}, {'sm': 2}]

export default function TodoList({ ...rest }) {
    const {theme} = useContext(ThemeContext);
    const { list } = useContext(TodoAPIContext);

    // const Headers = ['priority', 'title', 'completed'];
    const Headers = ['title', 'completed'];

    return (
        <ListGroup className='p-2 list-container' variant={theme}>
            <ListGroup.Item as={Row} key={-1} className='d-flex justify-content-between' variant='primary'>
                {Headers.map((head, idx) => <FilterSortHeader head={head} {...rest} layout={ColLayout[idx]}/>)}
            </ListGroup.Item>
            {list.map((todo) => (
                // <Todo key={e.id} user={user} todo={e} updateTodo={updateTodo} />
                <TodoItem todo={todo} {...rest} />
            ))}
        </ListGroup>
    );
}

export function TodoItem({ todo }) {
    const {theme, themeContrast1, themeContrast2} = useContext(ThemeContext);
    const {setShowTodo, setShowDelete} = useContext(ModalContext);
    const {list, moveItemTo, updateItem, active, setActive, setFormAction} = useContext(TodoAPIContext);

    // const [{ isDragging, opacity }, dragRef] = useDrag(() => ({
    //     type: ItemTypes.CARD,
    //     item: todo,
    //     collect: (monitor) => ({
    //         isDragging: monitor.isDragging(),
    //         opacity: monitor.isDragging() ? 0.5 : 1,
    //     }),
    // }), [list]);

    // const [isOverTop, setIsOverTop] = useState(false);
    // const [isOverBot, setIsOverBot] = useState(false);

    // const [{isOver}, dropRef] = useDrop(() => ({
    //     accept: ItemTypes.CARD,
    //     drop: (item, monitor) => {
    //         if (item.id === todo.id) return;
    //         moveItemTo(item, todo);
    //     },
    //     hover: (item, monitor) => {
    //         if (item.id === todo.id) return;
    //         if (! monitor.isOver({ shallow: true })) return;
    //         const idx1 = list.findIndex(e => e.id === item.id);
    //         const idx2 = list.findIndex(e => e.id === todo.id);

    //         if (idx1 > idx2) setIsOverTop(true);
    //         else setIsOverBot(true);
    //     },
    //     collect: monitor => ({
    //         isOver: !!monitor.isOver(),
    //     }),
    // }), [list]);

    const onDrop = (item, data) => {
        if (item.id === data.id) return;
        moveItemTo(item, data);
    };

    const onSelect = (todo) => {
        active === todo  ? setActive(null) : setActive(todo);
    };

    const onEdit = () => {
        setFormAction('edit');
        setShowTodo(true);
    };

    const onDelete = () => {
        setFormAction('delete');
        setShowDelete(true);
    };
    
    // if (isDragging) return <EmptyTodoItem />;
    return (
        <DragDropFrame type={ItemTypes.CARD} data={todo} onDrop={onDrop}>
        <ListGroup.Item as={Card} key={todo.id} bg={theme} text={themeContrast1} border={themeContrast2} className={`mt-1 p-0 bg-${theme}`}>

            <Card.Header as={Form} onSubmit={e => e.preventDefault()} className='d-flex justify-content-between' >
                <Form.Group as={Row} className='d-flex flex-grow-1' >
                    <Form.Label as={Col} {...ColLayout[0]} onClick={() => onSelect(todo)}> {`${todo.priority})  ${todo.title}`}</Form.Label>
                </Form.Group>
                <CompletedCheckbox todo={todo} />
            </Card.Header>
            <Card.Body as={Alert} show={active === todo} variant={themeContrast2}>
                <Card.Text>{todo.description}</Card.Text>
                <Card.Text>{todo.private ? 'Private' : 'Public'}</Card.Text>
                <Container className='d-flex justify-content-between'>
                    <Button variant='primary' size='sm' onClick={onEdit}>Edit</Button>
                    <Button variant='danger' size='sm' onClick={onDelete}>Delete</Button>
                </Container>
            </Card.Body>

        </ListGroup.Item>
        {/* <EmptyTodoItem /> */}
        {/* // </Container> */}
        </DragDropFrame>
    )
};

function DragDropFrame({children, type, data, onHover = () => 1, onDrop = () => 1}) {
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

    if (isDragging) return (<EmptyTodoItem ref={dragPreviewRef} />);
    
    return (
        <Container bg={theme} ref={dragRef} fluid className='m-0 p-0' >
            <Container bg={theme} ref={dropRef} fluid className='m-0 p-0' >
                {children}
            </Container>
        </Container>
    )
}

function CompletedCheckbox({ todo }) {
    const {updateItem} = useContext(TodoAPIContext);

    const onCheck = (todo, e) => {
        const data = {...todo, completed: e.target.checked};
        return updateItem(data);
    };

    return (
        <Form.Check className="todo-check" type='checkbox' checked={todo.completed} onChange={(e) => onCheck(todo, e)} />
    )
}

function EmptyTodoItem(props) {
    const {theme} = useContext(ThemeContext);
    return (
        <ListGroup.Item as={Card} bg={theme} key={-1} className='mt-1' {...props}>
            <p> </p>
            <p> </p>
            <p></p>
        </ListGroup.Item>
    )
}