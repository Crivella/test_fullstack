import { Alert, Button, Card, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import './TodoList.css';

export default function TodoList({ active, setActive, list, updateItem, deleteItem, ...rest }) {
    const {theme, themeContrast1, themeContrast2} = rest;
    const {setShowTodo, setShowDelete, setFormAction} = rest;
    const {sorting, setSorting} = rest;

    const Headers = ['priority', 'title', 'completed'];

    const onCheck = (todo, e) => {
        if (isNaN(e.currentTarget.value)) return false;
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

    // 0 - no sort, 1 - asc, 2 - desc
    const onSort = (head) => {
        const res = new Map(sorting)
        const app = res.get(head) | 0;
        res.delete(head)
        res.set(head, (app + 2)%3 - 1);
        setSorting(res);
        // setSorting({...sorting, ...app});
    };

     const arrows = {
        '-1': '↓ ',
        0: '',
        1: '↑ ',
     }


    return (
        <ListGroup className='p-2 list-container' variant={theme}>
            <ListGroup.Item key={-1} className='d-flex justify-content-between' variant='primary'>
                {Headers.map((head) => {return (
                    <span onClick={() => onSort(head)}>{arrows[sorting.get(head) | 0]}{head}</span> 
                )})}
            </ListGroup.Item>
            <ListGroup.Item key={-2} className='d-flex justify-content-between' variant='primary'>
               <Button onClick={() => console.log(sorting)}>TEST</Button>
            </ListGroup.Item>
            {list.map((todo) => (
                // <Todo key={e.id} user={user} todo={e} updateTodo={updateTodo} />
                <ListGroup.Item as={Card} key={todo.id} bg={theme} text={themeContrast1} border={themeContrast2} className='mt-1'>
                    <Card.Header as={Form} className='d-flex justify-content-between' >
                        <Form.Group as={Row} className='d-flex flex-grow-1' >
                            <Col sm={3} md={2}>
                                <Form.Control type='number' value={todo.priority} onChange={(e) => onPriority(todo, e)} />
                            </Col>
                            <Form.Label as={Col} sm={9} md={10} onClick={() => onSelect(todo.id)}> {todo.title}</Form.Label>
                        </Form.Group>
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
    );
}

// function SortHeader ({children, onReset, ...rest}) {
//     const [state, setState] = useState(0);

//     useEffect(() => {


//     const onSort = () => {
//         setState((state + 1) % 3);
//     };

    
    
//     return (
//         <span onClick={onSort}>{children}</span>
//     )
// }