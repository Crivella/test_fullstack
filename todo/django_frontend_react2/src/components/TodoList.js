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

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default function TodoList({user, id}) {
    const item = useAPITodoItem(id);

    const [list1, setList1] = useState([]);
    const [list2, setList2] = useState([]);

    const { 
        title, description, completed, first_completed,
        list, count_childrens, count_completed, parent,
        addItem, deleteItem, updateItem, swapItems,
        loading, error
     } = item;

     useEffect(() => {
        setList1(list.filter((item) => !item.completed));
        setList2(list.filter((item) => item.completed));
        }, [list]);

    const {user: loggedUser} = useContext(AuthContext);

    const [adding, setAdding] = useState(null); // [editing, setEditing

    const handleAdd = async (data) => {
        if (data?.title) await addItem(data);
        setAdding(false);
    }

    const onDrop = (item1, item2) => {
        swapItems(item1.id, item2.id);
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
                    {title ? `${title} (${count_completed}/${count_childrens})` : 'Lists'}
                    </p>
                </ListGroup.Item>

                <ListGroup.Item className='d-flex justify-content-center'>
                    <Button hidden={user !== loggedUser} onClick={() => setAdding(true)} variant='success' className='round-button-sm mx-2'>+</Button>
                </ListGroup.Item>

                {adding && <TodoItem user={user} 
                    handleAdd={handleAdd} />}

                {list1.map((item, idx) => (
                    <ListItemDragDropFrame
                        type={ItemTypes.CARD} data={item}
                        key={item.id}  
                        onDrop={onDrop}
                        placeHolder={<EmptyTodoItem />}
                        >
                        <TodoItem 
                            item={item} user={user} key={item.id} 
                            handleUpdate={updateItem} handleDelete={deleteItem}
                            />
                    </ListItemDragDropFrame>
                ))}
                {list2.map((item, idx) => (
                    <ListItemDragDropFrame
                        type={ItemTypes.CardCompleted} data={item}
                        key={item.id}  
                        onDrop={onDrop}
                        placeHolder={<EmptyTodoItem />}
                        >
                        <TodoItem 
                            item={item} user={user} key={item.id} 
                            handleUpdate={updateItem} handleDelete={deleteItem}
                            />
                    </ListItemDragDropFrame>
                ))}
            </ListGroup>
        </LoadingErrorFrame>
        <TrashCan onDelete={deleteItem} />
        </>
    );
}

function TodoItem({item, user, handleAdd, handleDelete, handleUpdate}) {
    const { 
        id, title, description, completed,
        count_childrens, count_completed,
     } = item || {};

     const [mode, setMode] = useState(null); // [editing, setEditing
     const [localTitle, setTitle] = useState('');

     useEffect(() => {
        setTitle(title);
    }, [title]);

    const _handleUpdate = (data) => {
        if (handleAdd !== undefined) {
            handleAdd(data || {title: localTitle});
        } else {
            handleUpdate(data || {id, title: localTitle});
        }
        setMode(null);
    }

    const _handleDelete = () => {
        handleDelete({id});
        setMode(null);
    }

    const buttonArrayEdit = () => (
        <>
        <Button onClick={() => setMode(null)} variant='danger' className='round-button-sm mx-2'>✗</Button>
        <Button onClick={_handleUpdate} variant='success' className='round-button-sm mx-2'>✓</Button>
        </>
    )
    const buttonArrayDelete = () => (
        <>
        <Button
            autoFocus onKeyDown={(e) => {e.key === 'Escape' && setMode(null)}} 
            onClick={() => setMode(null)} variant='danger' className='round-button-sm mx-2'>✗</Button>
        <Button onClick={_handleDelete} variant='success' className='round-button-sm mx-2'>✓</Button>
        </>
    )
    const buttonArrayNormal = () => (
        <>
        <Button onClick={() => setMode('edit')} variant='warning' className='round-button-sm mx-2'>✎</Button>
        <Button onClick={() => setMode('del')} variant='danger' className='round-button-sm mx-2'>🗑</Button>
        {/* <Button as={Link} to={`/${user}/${.id}`} variant='primary' className='round-button-sm mx-2'>⮞</Button> */}
        </>
    )
    const getButtonArray = () => {
        if (mode === 'edit' || id === undefined) return buttonArrayEdit();
        if (mode === 'del') return buttonArrayDelete();
        if (mode === 'show') return buttonArrayNormal();

        return (
            <>
                <Button onClick={() => setMode('show')} variant='primary' className='round-button-sm mx-2'>⋮</Button>
            </>
        )
    }

     return (
        <ListGroup.Item 
            // className='d-flex justify-content-between'
            // action={!item.completed}
            // action
            // href='#'
            className={`d-flex justify-content-between ${completed ? 'todo-completed' : ''}`}
            >
            {
                mode === 'edit' || id === undefined ?
                <Form.Control
                    type='text'
                    value={localTitle || ''}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                        switch (e.key) {
                            case 'Enter':
                                _handleUpdate();
                                break;
                            case 'Escape':
                                _handleUpdate({});
                                setMode(null);
                                // setEditing(null);
                                // setDeleting(null);
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
                    <Badge 
                        bg={count_childrens ? 'primary' : 'warning'} style={{marginRight: '10px'}} pill
                        as={Link} to={`/${user}/${id}`}
                        >&zwnj;</Badge>
                    <CompletedButton item={item} handleUpdate={handleUpdate} />
                    {title}
                </Form.Text>
            }
            <Form.Group controlId='formBasicCheckbox' className='d-flex'>
                {getButtonArray()}
            </Form.Group>
        </ListGroup.Item>
     )
}

function CompletedButton({item, handleUpdate, time = 500}) {
    const { completed } = item || {};

    const [persist, setPersist] = useState(false);
    const [_completed, setCompleted] = useState(completed);

    const _handleUpdate = () => {
        setPersist(true);
        timeout(time/2).then(() => setCompleted(!completed));
        timeout(time*2/3).then(() => handleUpdate({id: item.id, completed: !completed}));
        timeout(time).then(() => setPersist(false));
    }

    return (
        <Button 
            onClick={_handleUpdate} 
            variant={ _completed ? 'success' : 'outline-primary' }
            className={`round-button-sm mx-2 ${persist ? 'flip' : ''}`}
            >
            {_completed  ? '✓' : '✗'}
        </Button>
    )
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