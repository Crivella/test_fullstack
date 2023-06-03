import { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, ListGroup, Row, Spinner } from 'react-bootstrap';
import { useTodoItemAPI } from '../API/Hooks';
import { TodoAPIContext } from '../API/Todos';
import { ItemTypes } from '../Constants';
import { ModalContext, ThemeContext } from '../context/Contexts';
import { ListItemDragDropFrame } from './DragDrop';
import { FilterSortHeader } from './FilterSort';
import LoadingErrorFrame from './LoadingErrorFrame';
import { PaginationToolbar } from './PaginationToolbar';
import './TodoList.css';

// const ColLayout = [{'sm': 3, 'md':2}, {'sm': 7, 'md':8}, {'sm': 2}]
const ColLayout = [{'sm': 10}, {'sm': 2}]

export default function TodoList() {
    const {theme} = useContext(ThemeContext);
    const { list, loading, error, setActive } = useContext(TodoAPIContext);

    // Fix for small H-scroll https://stackoverflow.com/a/23768296/7604434
    return (
        <Container className='list-container'>
            <ListGroup className='px-3 py-1' variant={theme}>
                <TodoHeader />
                <LoadingErrorFrame 
                    onError={() => <TodoError error={error} />}
                    onLoading={() => <TodoLoading />} 
                    loading={loading} error={error}
                    >
                    <TodoBodyList list={list} setActive={setActive} />
                </LoadingErrorFrame>
            </ListGroup>
            <PaginationToolbar />
        </Container>
    );
}

function TodoHeader() {
    return (
        <ListGroup.Item as={Row} className='d-md-flex justify-content-between' variant='primary'>
            <FilterSortHeader head='Title' cname='title' layout={{'sm': 10}} />
            <FilterSortHeader head='' cname='completed' layout={{'sm': 1}} />
        </ListGroup.Item>
    )
}



function TodoBodyList({list = [], setActive}) {
    const [activeLocal, setActiveLocal] = useState(null);

    useEffect(() => {
        setActive(activeLocal);
    }, [activeLocal, setActive]);

    return (
        <>
        {list.map((id) => (
            <TodoItem id={id} key={id} active={activeLocal} setActive={setActiveLocal} />
            ))}
        </>
    )
}

function TodoItem({ id, active, setActive }) {
    const {data, loading, error} = useTodoItemAPI(id);

    return (
        <LoadingErrorFrame 
            onError={() => <TodoError error={error} />}
            onLoading={() => <TodoLoading />}
            loading={loading} error={error}
            >
            <TodoItemBody data={data} active={active} setActive={setActive} />
        </LoadingErrorFrame>
    )
};

function TodoItemBody({data = {}, active, setActive}) {
    const {theme, themeContrast1, themeContrast2} = useContext(ThemeContext);
    const {setShowTodo, setShowDelete} = useContext(ModalContext);
    const {setFormAction, dispatch} = useContext(TodoAPIContext);

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

    const onDrop = useCallback(async ( itm1, itm2 ) => {
        await dispatch({type: 'moveInsert', data: {itm1, itm2}})
    }, [dispatch]);

    return (
        <ListItemDragDropFrame 
            type={data.completed ? ItemTypes.CardCompleted : ItemTypes.CARD} data={data} 
            onDrop={onDrop}
            placeHolder={<EmptyTodoItem />}
        >
        <ListGroup.Item 
            as={Card}  
            bg={theme} text={themeContrast1} 
            border={themeContrast2} 
            className={`mt-1 p-0 ${ data.completed ? 'todo-completed' : ''}`}
            >
            <Card.Header as={Form} onSubmit={e => e.preventDefault()} className='d-md-flex justify-content-between' >
                <Form.Group as={Row} className='d-flex flex-grow-1' >
                    <Form.Label as={Col} {...ColLayout[0]} onClick={() => onSelect(data)}> {data.title} </Form.Label>
                </Form.Group>
                <CompletedCheckbox todo={data} />
            </Card.Header>
            <Card.Body as={Alert} show={active === data} variant={themeContrast2}>
                <Card.Text>{data.description}</Card.Text>
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
    const {dispatch} = useContext(TodoAPIContext);

    const onCheck = (todo, e) => {
        const data = {...todo, completed: e.target.checked};
        return dispatch({type: 'update', data});
    };

    return (
        <Form.Check className="todo-check" type='checkbox' checked={todo.completed} onChange={(e) => onCheck(todo, e)} />
    )
}

function TodoLoading() {
    return (
        <ListGroup.Item as={Alert} variant='primary'>
            <Alert.Heading>Loading...</Alert.Heading>
            <Spinner animation='border' variant='primary' />
        </ListGroup.Item>
    )
}

function TodoError({error}) {
    return (
        <ListGroup.Item as={Alert} variant='danger'>
            <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
            <p>{error.message}</p>
        </ListGroup.Item>
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