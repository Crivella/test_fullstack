import { Alert, Button, Card, Container, ListGroup } from 'react-bootstrap';

export default function TodoList({ active, setActive, list, updateItem, deleteItem, ...rest }) {
    const {theme, themeContrast1, themeContrast2} = rest;
    const {setShowTodo, setShowDelete, setFormAction} = rest;

    const onCheck = (todo, e) => {
        const data = {...todo, completed: e.target.checked};
        updateItem(todo.id, data);
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
        <Container className='py-2'>
            <ListGroup className='p-2' variant={theme}>
                <ListGroup.Item className='list-group-item d-flex justify-content-between' variant='primary'>
                    <span>Titles</span>
                    <span>Completed</span>
                </ListGroup.Item>
                {list.map((todo) => (
                    // <Todo key={e.id} user={user} todo={e} updateTodo={updateTodo} />
                    <ListGroup.Item as={Card} key={todo.id} bg={theme} text={themeContrast1} border={themeContrast2} className='mt-1'>
                        <Card.Header className='d-flex justify-content-between' >
                            <span onClick={() => onSelect(todo.id)}>{todo.title}</span>
                            <input style={{width: '2rem'}} type='checkbox' checked={todo.completed} onChange={(e) => onCheck(todo, e)}/>
                        </Card.Header>
                        <Card.Body as={Alert} show={active == todo.id} variant={themeContrast2}>
                            <Card.Text>{todo.description}</Card.Text>
                            <Card.Text>{todo.private ? 'Private' : 'Public'}</Card.Text>
                            <Container className='d-flex justify-content-between'>
                                <Button variant='primary' size='sm' onClick={onEdit}>Edit</Button>
                                <Button variant='danger' size='sm' onClick={onDelete}>Delete</Button>
                            </Container>
                        </Card.Body>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
}
