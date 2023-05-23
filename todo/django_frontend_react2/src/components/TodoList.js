import { useContext, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { TodoAPIContext } from '../API/TodoListWrapper';
import { ItemTypes } from '../Constants';
import { ThemeContext } from '../commons/ThemeWrapper';
import { ListItemDragDropFrame } from './DragDrop';
import { FilterSortHeader } from './FilterSort';
import { ModalContext } from './Modals';
import './TodoList.css';

// const ColLayout = [{'sm': 3, 'md':2}, {'sm': 7, 'md':8}, {'sm': 2}]
const ColLayout = [{'sm': 10}, {'sm': 2}]

export default function TodoList() {
    const {theme} = useContext(ThemeContext);
    const { list } = useContext(TodoAPIContext);

    const [active, setActive] = useState(null);
    // const Headers = ['priority', 'title', 'completed'];
    const Headers = ['title', 'completed'];

    // Fix for small H-scroll https://stackoverflow.com/a/23768296/7604434
    return (
        <ListGroup className='px-3 py-1 list-container' variant={theme}>
            <ListGroup.Item as={Row} key={-1} className='d-flex justify-content-between' variant='primary'>
                {Headers.map((head, idx) => <FilterSortHeader head={head} layout={ColLayout[idx]}/>)}
            </ListGroup.Item>
            {list.map((todo,idx) => (
                // <Todo key={e.id} user={user} todo={e} updateTodo={updateTodo} />
                <TodoItem todo={todo} idx={idx} active={active} setActive={setActive} />
            ))}
        </ListGroup>
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
            type={ItemTypes.CARD} data={todo} 
            onDrop={moveItemTo}
            placeHolder={<EmptyTodoItem />}
        >
        <ListGroup.Item as={Card} {...rest} bg={theme} text={themeContrast1} border={themeContrast2} className={`mt-1 p-0`}>
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