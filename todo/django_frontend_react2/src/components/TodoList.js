import { useContext } from 'react';
import { Alert, Button, Card, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { useDrag, useDrop } from 'react-dnd';
import { FilterSortContext } from '../API/FilterSortWrapper';
import { ListContext } from '../API/ListWrapper';
import { ItemTypes } from '../Constants';
import { ThemeContext } from '../commons/ThemeWrapper';
import { FilterSortHeader } from './FilterSort';
import './TodoList.css';

const ColLayout = [{'sm': 3, 'md':2}, {'sm': 7, 'md':8}, {'sm': 2}]

export default function TodoList({ ...rest }) {
    const {theme, themeContrast1, themeContrast2} = useContext(ThemeContext);
    const { list} = useContext(ListContext);

    const Headers = ['priority', 'title', 'completed'];

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

export function TodoItem({ todo, ...rest }) {
    const {theme, themeContrast1, themeContrast2} = useContext(ThemeContext);
    const {setShowTodo, setShowDelete, setFormAction} = useContext(ListContext);
    const {updateItem, active, setActive, list} = useContext(ListContext);
    const {sorting} = useContext(FilterSortContext);

    const [{ opacity }, dragRef] = useDrag(() => ({
        type: ItemTypes.CARD,
        item: { ...todo },
        collect: (monitor) => ({
            opacity: monitor.isDragging() ? 0.5 : 1,
        }),
    }), [list]);

    const [{isOver}, dropRef] = useDrop(() => ({
        accept: ItemTypes.CARD,
        drop: (item, monitor) => {
            if (item.id === todo.id) return;
            let offset = sorting.get('priority');
            if (offset === 0) return;
            if (list.findIndex(e => e.id === item.id) > list.indexOf(todo)) offset *= -1;
            updateItem(item.id, {...item, priority: todo.priority + offset});
        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    }), [list]);

    const onCheck = (todo, e) => {
        const data = {...todo, completed: e.target.checked};
        return updateItem(todo.id, data);
    };
    const onPriority = (todo, e) => {
        const data = {...todo, priority: e.currentTarget.value};
        return updateItem(todo.id, data);
    };

    const onSelect = (id) => {
        active === id ? setActive(null) : setActive(id);
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
        <ListGroup.Item ref={dragRef} style={{ opacity }} as={Card} key={todo.id} bg={theme} text={themeContrast1} border={themeContrast2} className='mt-1'>
            <Card.Header ref={dropRef} variant={isOver ? 'success' : 'dark'} as={Form} onSubmit={(e) => e.preventDefault()} className='d-flex justify-content-between' >
                <Form.Group as={Row} className='d-flex flex-grow-1' >
                    <Col {...ColLayout[0]}>
                        <Form.Control type='number' value={todo.priority} onChange={(e) => onPriority(todo, e)} />
                    </Col>
                    <Form.Label as={Col} {...ColLayout[1]} onClick={() => onSelect(todo.id)}> {todo.title}</Form.Label>
                </Form.Group>
                <input style={{width: '2rem'}} type='checkbox' checked={todo.completed} onChange={(e) => onCheck(todo, e)}/>
            </Card.Header>
            <Card.Body as={Alert} show={active === todo.id} variant={themeContrast2}>
                <Card.Text>{todo.description}</Card.Text>
                <Card.Text>{todo.private ? 'Private' : 'Public'}</Card.Text>
                <Container className='d-flex justify-content-between'>
                    <Button variant='primary' size='sm' onClick={onEdit}>Edit</Button>
                    <Button variant='danger' size='sm' onClick={onDelete}>Delete</Button>
                </Container>
            </Card.Body>
        </ListGroup.Item>
    )
};