import { useContext, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { ItemTypes } from '../Constants';
import { TodoAPIContext } from '../Context/API';
import { ThemeContext } from '../commons/ThemeWrapper';
import { ListItemDragDropFrame } from './DragDrop';
import { FilterSortHeader } from './FilterSort';
import { ModalContext } from './Modals';
import { PaginationToolbar } from './PaginationToolbar';
import './TodoList.css';

// const ColLayout = [{'sm': 3, 'md':2}, {'sm': 7, 'md':8}, {'sm': 2}]
const ColLayout = [{'sm': 10}, {'sm': 2}]

export default function TodoList() {
    const {theme} = useContext(ThemeContext);
    const { list, setActive } = useContext(TodoAPIContext);

    const [activeLocal, setActiveLocal] = useState(null);
    // const Headers = ['priority', 'title', 'completed'];

    useEffect(() => {
        setActive(activeLocal);
    }, [activeLocal, setActive]);

    // Fix for small H-scroll https://stackoverflow.com/a/23768296/7604434
    return (
        <Container  className='list-container'>
        <ListGroup className='px-3 py-1' variant={theme}>
            <Container fluid className='m-0 p-0' >
            <ListGroup.Item as={Row} className='d-md-flex justify-content-between' variant='primary'>
                {/* {Headers.map((head, idx) => <FilterSortHeader head={head} key={idx} layout={ColLayout[idx]}/>)} */}
                <FilterSortHeader head='Title' cname='title' layout={{'sm': 10}} />
                <FilterSortHeader head='' cname='completed' layout={{'sm': 1}} />
            </ListGroup.Item>
            </Container>
            {list.map((todo,idx) => (
                // <Todo key={e.id} user={user} todo={e} updateTodo={updateTodo} />
                <TodoItem todo={todo} key={idx} active={activeLocal} setActive={setActiveLocal} />
            ))}
        </ListGroup>
        <PaginationToolbar />
        </Container>
    );
}

export function TodoItem({ todo, active, setActive, ...rest }) {
    const {theme, themeContrast1, themeContrast2} = useContext(ThemeContext);
    const {setShowTodo, setShowDelete} = useContext(ModalContext);
    const {moveItemTo, setFormAction} = useContext(TodoAPIContext);

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

    return (
        <ListItemDragDropFrame 
            type={todo.completed ? ItemTypes.CardCompleted : ItemTypes.CARD} data={todo} 
            onDrop={moveItemTo}
            placeHolder={<EmptyTodoItem />}
        >
        <ListGroup.Item 
            as={Card}  
            bg={theme} text={themeContrast1} 
            border={themeContrast2} 
            className={`mt-1 p-0 ${ todo.completed ? 'todo-completed' : ''}`}
            {...rest}
            >
            <Card.Header as={Form} onSubmit={e => e.preventDefault()} className='d-md-flex justify-content-between' >
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
        </ListItemDragDropFrame>
    )
};



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
        </ListGroup.Item>
    )
}