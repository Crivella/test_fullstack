import { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, ListGroup, Row, Spinner } from 'react-bootstrap';
import { useTodoItemAPI, useTodoMapAPI } from '../API/Hooks';
import { ItemTypes } from '../Constants';
import { ThemeContext } from '../context/Contexts';
import { ListItemDragDropFrame } from './DragDrop';
import './ExtraButtons.css';
import { FilterSortHeader } from './FilterSort';
import InfiniteScrollToolbar from './InfiniteScrollToolbar';
// import PaginationToolbar from './PaginationToolbar';
import LoadingErrorFrame from './LoadingErrorFrame';
import './TodoList.css';

import { createContext } from 'react';
import { useDrop } from 'react-dnd';

const mapContext = createContext();

// const ColLayout = [{'sm': 3, 'md':2}, {'sm': 7, 'md':8}, {'sm': 2}]
const ColLayout = [{'sm': 10}, {'sm': 2}]

export default function TodoList({id}) {
    const {theme} = useContext(ThemeContext);
    const map =  useTodoMapAPI(id);
    const {loading, error, deleteItem } = map;

    // Fix for small H-scroll https://stackoverflow.com/a/23768296/7604434
    return (
        <mapContext.Provider value={map}>
        <Container className='list-container'>
            <ListGroup className='px-3 py-1' variant={theme}>
                <TodoHeader />
                <LoadingErrorFrame 
                    onError={() => <TodoError error={error} />}
                    onLoading={() => <TodoLoading />} 
                    loading={loading} error={error}
                    >
                    <TodoBodyList />
                </LoadingErrorFrame>
            </ListGroup>
            <InfiniteScrollToolbar />
            {/* <PaginationToolbar /> */}
            <TrashCan onDelete={deleteItem} />
        </Container>
        </mapContext.Provider>
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



function TodoBodyList() {
    const [active, setActive] = useState(null);
    const {list = [], addItem, deleteItem, onSwap} = useContext(mapContext);

    return (
        <>
            <TodoAddItem addItem={addItem} />
            {list.map((id) => (
                <TodoItem id={id} key={id} active={active} setActive={setActive} />
                ))}
        </>
    )
}

function TodoItem({ id, active, setActive }) {
    const {loading, error, ...item} = useTodoItemAPI(id);
    const { deleteItem } = useContext(mapContext);

    const onDelete = useCallback(() => {
        deleteItem(item.data);
        item.delete();
        setActive(null);
    }, [item, setActive, deleteItem]);

    return (
        <LoadingErrorFrame 
            onError={() => <TodoError error={error} />}
            onLoading={() => <TodoLoading />}
            loading={loading} error={error}
            >
            <TodoItemBody 
                item={item} 
                active={active} setActive={setActive} 
                onDelete={onDelete}
            />
        </LoadingErrorFrame>
    )
};

function TodoItemBody({item, active, setActive, onDelete}) {
    const {theme, themeContrast1, themeContrast2} = useContext(ThemeContext);
    // const {setShowTodo, setShowDelete} = useContext(ModalContext);
    // const {setFormAction, dispatch} = useContext(TodoAPIContext);
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { onSwap } = useContext(mapContext);

    const {data = {}, update} = item;

    const [title, setTitle] = useState(data.title);
    const [description, setDescription] = useState(data.description);

    useEffect(() => {
        if (active !== data) {
            setEditing(false);
            setDeleting(false);
        }
    }, [active, data]);

    useEffect(() => {
        if (!editing) {
            setTitle(data.title);
            setDescription(data.description);
        }
    }, [data, editing]);

    // const title = useRef();
    const onSelect = (itm) => {
        active === itm  ? setActive(null) : setActive(itm);
    };

    const onUpdate = () => {
        const newData = {...data, title, description};
        update(newData);
        setEditing(false);
    };

    const onDrop = useCallback(( itm1, itm2 ) => {
        onSwap(itm1.data, itm2.data);
    }, [onSwap]);

    const modeProps = {
        item,
        editing, setEditing,
        deleting, setDeleting,
        onUpdate, onDelete,
        title, setTitle,
        description, setDescription,
        onSelect,
    }

    const lgItemProps = {
        as: Card,
        bg: theme,
        text: themeContrast1,
        border: themeContrast2,
        className: `mt-1 p-0 ${ data.completed ? 'todo-completed' : ''}`,
    }

    if (editing){
        return (
            <ListGroup.Item {...lgItemProps}>
                <ItemHeaderEditing item={item} {...modeProps} />
                <ItemBody active={active === data} {...modeProps} />
            </ListGroup.Item>
        )
    }

    return (
        <ListItemDragDropFrame 
            type={data.completed ? ItemTypes.CardCompleted : ItemTypes.CARD} data={item} 
            onDrop={onDrop}
            placeHolder={<EmptyTodoItem />}
        >
            <ListGroup.Item {...lgItemProps}>
                <ItemHeader item={item} onSelect={onSelect}/>
                <ItemBody active={active === data} {...modeProps} />
            </ListGroup.Item>
        </ListItemDragDropFrame>
    )
};

function ItemHeader({item, onSelect}) {
    const {data = {}} = item;

    return (
        <Card.Header as={Form} onSubmit={e => e.preventDefault()} className='d-md-flex justify-content-between' >
            <Form.Group as={Row} className='d-flex flex-grow-1' >
                <Form.Label as={Col} {...ColLayout[0]} onClick={() => onSelect(data)}> {data.title} </Form.Label>
            </Form.Group>
            <CompletedCheckbox item={item} />
        </Card.Header>
    )
}

function ItemHeaderEditing({item, ...props}) {
    const {onUpdate, title, setTitle} = props;

    return (
        <Card.Header as={Form} onSubmit={e => {e.preventDefault(); onUpdate()}} className='d-md-flex justify-content-between' >
            <Form.Group as={Row} className='d-flex flex-grow-1' >
                <Form.Control 
                    type='title'
                    // as={Col} 
                    // {...ColLayout[0]} 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    />
            </Form.Group>
            <CompletedCheckbox item={item} />
        </Card.Header>
    )
}

function ItemBody({item, active, ...props}) {
    const {theme} = useContext(ThemeContext);
    const {editing, onUpdate, description, setDescription} = props;

    return (
        <Card.Body as={Alert} show={active} variant={theme}>
            <Row className='d-flex justify-content-between'>

                <Form.Group as={Col} {...ColLayout[0]} onSubmit={onUpdate} >
                    <Form.Control

                        as='textarea'
                        rows={3}
                        disabled={!editing}
                        value={description || ''}
                        onChange={(e) => setDescription(e.target.value)}
                        />
                </Form.Group>

                <ButtonArray {...props}  />
            </Row>
        </Card.Body>
    )
}

function ButtonArray(props) {
    const {editing, setEditing, deleting, setDeleting, onUpdate, onDelete} = props;

    let array;
    if (editing) {
        array = (
            <>
            <Button 
                variant='primary'
                className='round-button-sm my-1' 
                size='sm' onClick={onUpdate}>✓</Button>
            <Button 
                variant='warning'
                className='round-button-sm my-1' 
                onKeyDown={(e) => {if (e.key === 'Escape') setEditing(false)}}
                onClick={() => setEditing(false)}>↩</Button>
            </> 
        )
    } else if (deleting) {
        array = (
            <>
            <Button
                variant='danger'
                className='round-button-sm my-1' 
                onClick={onDelete}>!!</Button>
            <Button
                variant='warning'
                className='round-button-sm my-1' 
                onClick={() => setDeleting(false)}>↩</Button>         
            </>
        )
    } else {
        array = (
            <>
            <Button
                variant='primary'
                className='round-button-sm my-1'
                size='sm' onClick={() => setEditing(true)}>✎</Button>
            <Button
                variant='danger'
                className='round-button-sm my-1'
                onClick={() => setDeleting(true)}>X</Button>
            </>
        )
    }

    return (
        <Col sm={1} className='d-inline-flex justify  ml-auto'>
            <Container className='d-flex flex-column justify-content-center'>
            { array }
            </Container>
        </Col>
    )
}

function CompletedCheckbox({ item }) {
    const {data = {}} = item;

    const onCheck = (e) => {
        item.update({completed: e.target.checked});
    };

    return (
        <Form.Check className="todo-check" type='checkbox' checked={data.completed} onChange={onCheck} />
    )
}

// An empty loading item
function TodoLoading() {
    return (
        <ListGroup.Item as={Alert} variant='primary'>
            <Alert.Heading>Loading...</Alert.Heading>
            <Spinner animation='border' variant='primary' />
        </ListGroup.Item>
    )
}

// An empty error item
function TodoError({error}) {
    return (
        <ListGroup.Item as={Alert} variant='danger'>
            <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
            <p>{error.message}</p>
        </ListGroup.Item>
    )
}

function TodoAddItem({addItem}) {
    const {theme} = useContext(ThemeContext);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [adding, setAdding] = useState(false);

    const onSubmit = (e) => {
        e.preventDefault();
        addItem({title, description});
        setAdding(false);
        setTitle('');
        setDescription('');
    };

    const onCancel = () => {
        setAdding(false);
        setTitle('');
        setDescription('');
    };

    if (adding) {
        return (
            <ListGroup.Item as={Form}  className='d-flex' variant={theme}>
                <Container as={Col} className='flex-grow-1'>
                    <Form.Group as={Row} className='d-flex flex-grow-1' onSubmit={onSubmit}>
                        <Form.Control
                            type='title'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            />
                    </Form.Group>
                    <Form.Group as={Row} className='d-flex flex-grow-1' onSubmit={onSubmit}>
                        <Form.Control
                            type='description'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            />
                    </Form.Group>
                </Container>
                <Container as={Col} sm={1} className='d-flex flex-column justify-content-end'>
                    <Button variant='primary' className='round-button-sm my-1' onClick={onSubmit} >✓</Button>
                    <Button variant='warning' className='round-button-sm my-1' onClick={onCancel} >↩</Button>
                </Container>
            </ListGroup.Item>
        )
    }

    return (
        <ListGroup.Item as={Form}  className='d-md-flex justify-content-center' variant={theme}>
            <Button variant='primary' className='round-button-sm my-1' onClick={() => setAdding(true)} >+</Button>
        </ListGroup.Item>
    )
}

// An empty item to fill in the space when dragging
function EmptyTodoItem(props) {
    const {theme} = useContext(ThemeContext);
    return (
        <ListGroup.Item as={Card} bg={theme} key={-1} className='mt-1' {...props}>
            <p> </p>
        </ListGroup.Item>
    )
}

function TrashCan({onDelete}) {
    const {themeContrast1} = useContext(ThemeContext);
    // const { setActive, setFormAction } = useContext(TodoAPIContext);
    const [{canDrop, extraClass}, dropRef] = useDrop(() => ({
        accept: [ItemTypes.CARD, ItemTypes.CardCompleted],
        drop: (item, monitor) => {
            onDelete(item.data);
            item.delete();
        },
        collect: monitor => ({
            canDrop: !monitor.canDrop(),
            extraClass: monitor.canDrop() ? 'expandPoint' : 'collapsePoint',
        }),
    }), [onDelete]);

    return (
        <Button ref={dropRef} className={`round-button pos-bl ${extraClass}`} variant="primary">
            <span style={{paddingBottom: 10}} className={`text-${themeContrast1}`}>🗑</span>
        </Button>
    );
}