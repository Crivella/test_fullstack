import { useContext, useEffect, useState } from 'react';
import { Alert, Badge, Button, Form, ListGroup, Spinner } from 'react-bootstrap';
import { useDrop } from 'react-dnd';
import { Link } from 'react-router-dom';
import { AuthContext } from '../API/Auth';
import { useAPITodoItem } from '../API/Hooks';
import { ItemTypes } from '../Constants';
import { ThemeContext } from '../context/Theme';
import { ListItemDragDropFrame } from './DragDrop';
import './ExtraButtons.css';
import LoadingErrorFrame from './LoadingErrorFrame';
import './TodoList.css';

export default function TodoList({user, id}) {
    const { 
        title, description, completed,
        list, count, countCompleted, parent,
        addItem, deleteItem, updateItem, swapItems,
        loading, error
     } = useAPITodoItem(id);

    const {user: loggedUser} = useContext(AuthContext);

    const [editing, setEditing] = useState(null); // [editing, setEditing
    const [deleting, setDeleting] = useState(null); // [editing, setEditing
    const [localTitle, setTitle] = useState('');

    useEffect(() => {
        if (editing) {
            const app = list.find((item) => item.id === editing);
            setTitle(app.title);
        }
    }, [editing, list]);

    useEffect(() => {
        console.log('loading', loading);
    }, [loading]);

    const handleUpdate = () => {
        updateItem({id: editing, title: localTitle});
        setEditing(null);
    }

    const handleAdd = async () => {
        const data = await addItem({});
        setEditing(data.id);
    }

    const handleDelete = () => {
        console.log('handleDelete', deleting);
        // deleteItem({id: deleting});
        setDeleting(null);
    }

    const buttonArrayEdit = (item) => (
            <>
            <Button onClick={() => setEditing(null)} variant='danger' className='round-button-sm mx-2'>✗</Button>
            <Button onClick={handleUpdate} variant='success' className='round-button-sm mx-2'>✓</Button>
            </>
        )
    const buttonArrayDelete = (item) => (
            <>
            <Button onClick={() => setDeleting(null)} variant='danger' className='round-button-sm mx-2'>✗</Button>
            <Button onClick={handleDelete} variant='success' className='round-button-sm mx-2'>✓</Button>
            </>
        )
    const buttonArrayNormal = (item) => (
            <>
            <Button onClick={() => setEditing(item.id)} variant='warning' className='round-button-sm mx-2'>✎</Button>
            <Button onClick={() => setDeleting(item.id)} variant='danger' className='round-button-sm mx-2'>🗑</Button>
            {/* <Button as={Link} to={`/${user}/${item.id}`} variant='primary' className='round-button-sm mx-2'>⮞</Button> */}
            </>
        )
    const getButtonArray = (item) => {
        if (editing === item.id) return buttonArrayEdit(item);
        if (deleting === item.id) return buttonArrayDelete(item);
        return buttonArrayNormal(item);
    }

    return (
        <>
        <LoadingErrorFrame
            loading={loading}
            error={error}
            onError={(e) => <TodoError error={e} />}
            onLoading={() => <TodoLoading />}
        >
            <ListGroup className='list-container mx-auto'>
                <ListGroup.Item variant='primary d-flex'>
                    <div className='d-inline-flex flex-column align-items-center justify-content-center p-0 m-0'>
                        <Button hidden={parent === null} as={Link} to={`/${user}/${parent}`} variant='primary' className='round-button-sm mx-2'>⮜</Button>
                        <Button hidden={parent !== null || !id } as={Link} to={`/${user}`} variant='primary' className='mr-5'
                        style={{marginRight:5}}>⮜</Button>
                    </div>
                    <p className='list-title m-auto'>
                    {title ? `${title} (${countCompleted}/${count})` : 'Lists'}
                    </p>
                </ListGroup.Item>

                <ListGroup.Item className='d-flex justify-content-center'>
                    <Button hidden={user !== loggedUser} onClick={handleAdd} variant='success' className='round-button-sm mx-2'>+</Button>
                </ListGroup.Item>

                {list.map((item, idx) => (
                    <ListItemDragDropFrame
                        type={item.completed ? ItemTypes.CardCompleted : ItemTypes.CARD} data={item}
                        key={item?.id || -idx}  
                        onDrop={swapItems}
                        placeHolder={<EmptyTodoItem />}
                            >
                    <ListGroup.Item 
                        // className='d-flex justify-content-between'
                        // action={!item.completed}
                        action
                        // href='#'
                        className={`d-flex justify-content-between ${item.completed ? 'todo-completed' : ''}`}
                        >
                        {
                            editing === item.id ?
                            <Form.Control
                                type='text'
                                value={localTitle || ''}
                                onChange={(e) => setTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    switch (e.key) {
                                        case 'Enter':
                                            handleUpdate();
                                            break;
                                        case 'Escape':
                                            setEditing(null);
                                            setDeleting(null);
                                            break;
                                        default:
                                            break;
                                    }
                                }}
                                // onBlur={() => setEditing(null)}
                                autoFocus
                            />
                            :
                            <Form.Text className='text-muted'>
                                { 
                                    item.count_completed !== undefined
                                    ?
                                    <Badge 
                                        bg="primary" style={{marginRight: '10px'}} pill
                                        as={Link} to={`/${user}/${item.id}`}
                                        >
                                        {item.count_completed} / {item.count_childrens}
                                    </Badge>
                                    :
                                    ''
                                }
                                {item.title}
                            </Form.Text>
                        }
                        <Form.Group controlId='formBasicCheckbox' className='d-flex'>
                            {getButtonArray(item)}
                        </Form.Group>
                    </ListGroup.Item>
                    </ListItemDragDropFrame>
                ))}
            </ListGroup>
        </LoadingErrorFrame>
        <TrashCan onDelete={deleteItem} />
        </>
    );
}


function EmptyTodoItem() {
    return (
        <ListGroup.Item className='d-flex justify-content-between todo-light'>
            <Form.Text className='text-muted'>
                
            </Form.Text>
        </ListGroup.Item>
    );
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
            <p>{error?.message}</p>
        </ListGroup.Item>
    )
}

export function TrashCan({onDelete}) {
    const {themeContrast1} = useContext(ThemeContext);
    // const { setActive, setFormAction } = useContext(TodoAPIContext);
    const [{canDrop, extraClass}, dropRef] = useDrop(() => ({
        accept: [ItemTypes.CARD, ItemTypes.CardCompleted],
        drop: (item, monitor) => {
            onDelete(item);
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