import { useContext, useEffect, useState } from 'react';
import { Alert, Button, Container, Form, Image, ListGroup, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { useDrop } from 'react-dnd';
import { Link } from 'react-router-dom';
import { AuthContext } from '../API/Auth';
import { ActiveContext } from '../API/Contexts';
import { useAPITodoItem } from '../API/Hooks';
import { ItemTypes } from '../Constants';
import { ThemeContext } from '../context/Contexts';
import { ListItemDragDropFrame } from './DragDrop';
import { CompletedButton, FavoriteButton } from './FlippableButton';
import LoadingErrorFrame from './LoadingErrorFrame';
import './TodoList.css';

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
        if (data != null) await addItem(data);
        setAdding(false);
    }

    const onDrop = (item1, item2) => {
        swapItems(item1.id, item2.id);
    }

    const getTitle = () => {
        if (id === undefined) return 'Lists';
        if (id === 'favorites') return 'Favorites';
        return title;
    }

    return (
        <>
        <LoadingErrorFrame
            loading={loading}
            error={error}
            onError={(e) => <TodoError error={e} />}
            onLoading={() => <TodoLoading />}
        >
            <ListGroup className='list-container h-100'>
                <ListGroup.Item variant='primary d-flex'>
                    <div className='d-inline-flex flex-column align-items-center justify-content-center p-0 m-0'>
                        <Button hidden={parent === null} as={Link} to={`/${user}/${parent}`} variant='primary' className='round-button-sm mx-2'>⮜</Button>
                        <Button hidden={parent !== null || !id } as={Link} to={`/${user}`} variant='primary' className='mr-5'
                        style={{marginRight:5}}>⮜</Button>
                    </div>
                    <p className='list-title m-auto'>
                    {getTitle()}
                    </p>
                    { 
                        (id !== undefined && id !== 'favorites' ) 
                        && 
                        <FavoriteButton item={item} handleUpdate={updateItem} />
                    }
                </ListGroup.Item>

                {
                    id !== 'favorites'
                    &&
                    <ListGroup.Item className='d-flex justify-content-center'>
                        <Button hidden={user !== loggedUser} onClick={() => setAdding(true)} variant='success' className='round-button-sm mx-2'>+</Button>
                    </ListGroup.Item>
                }

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
    const { id, completed } = item || {};

     const { active, setActive } = useContext(ActiveContext);

     const [mode, setMode] = useState(null);

    const _handleUpdate = (data) => {
        if (handleAdd !== undefined) {
            handleAdd(data);
        } else {
            if (data !== null) handleUpdate({id, ...data});
        }
        setMode(null);
    }

    const handleEdit = (e) => {
        if (e) e.preventDefault();
        if (e) e.stopPropagation();

        setMode('edit');
    }

    const onClick = () => {
        if (mode === 'edit') return;
        if (id === undefined) return;
        if (active === id) {
            setActive(null);
            return;
        }
        setActive(item.id);
    }

    return (
        <ListGroup.Item 
            className={`
                d-flex justify-content-between list-item px-0 
                ${completed ? 'todo-completed' : ''}
                ${active === id ? 'border-primary' : ''}
            `}
            onClick={onClick}
            // action
            // active={active === id}
            >

            {
                mode === 'edit' || id === undefined ?
                <TodoForm item={item} handleUpdate={_handleUpdate} />
                :
                <>
                <div>
                    <CompletedButton item={item} handleUpdate={handleUpdate} />
                    <TodoNormal item={item} user={user} />
                </div>
                <Form.Group controlId='formButtonArray' className='d-flex'>
                    {
                        active === id && 
                        <Button onClick={handleEdit} variant='warning' className='round-button-sm mx-2'>
                            ✎
                        </Button>
                    }
                </Form.Group>
                </>

            }
        
        </ListGroup.Item>
     )
}

function ChildBadge({ item, user }) {
    const {id, count_childrens, count_completed} = item || {};
    const [badgeColor, setBadgeColor] = useState('secondary');

    useEffect(() => {
        if (count_childrens) {
            if (count_childrens === count_completed) {
                setBadgeColor('success');
            } else {
                setBadgeColor('primary');
            }
        } else {
            setBadgeColor('secondary');
        }
    }, [count_childrens, count_completed]);

    return (
        <Container
            className={`bg-${badgeColor} m-0 px-2 py-2`}
            as={Link} to={`/${user}/${id}`}
            onClick={(e) => e.stopPropagation()}
            bg={badgeColor}
            style={{borderRadius: 5}}
            />
    )
}

function TodoNormal({item, user,}) {
    const { title, description } = item || {};

    const { themeContrast1 } = useContext(ThemeContext);

    const renderDescription = () => {
        return (
            <Tooltip id='tooltip-description' placement='bottom' className='in' style={{opacity: 1}}>
                <div className='tooltip-inner'>
                    {description}
                </div>
            </Tooltip>
        )
    }

    return (
        <Form.Text>
            <ChildBadge item={item} user={user} />
            <div className={`d-inline-flex text-${themeContrast1}`} style={{inlineSize: '640px'}}>
                {title}
                {
                    description && (
                        <OverlayTrigger
                            placement='bottom'
                            delay={{ show: 250, hide: 100 }}
                            overlay={renderDescription()}
                        >
                            <Button variant='outline-primary' className='round-button-sm mx-2'>?</Button>
                        </OverlayTrigger>
                    )
                }
            </div>
        </Form.Text>
    )
}

function TodoForm({ item, handleUpdate }) {
    const { title, description } = item || {};
    const [localTitle, setLocalTitle] = useState('');
    const [localDescription, setLocalDescription] = useState('');

    useEffect(() => {
        setLocalTitle(title);
    }, [title]);

    useEffect(() => {
        setLocalDescription(description);
    }, [description]);
    
    const handleCancel = () => {
        handleUpdate(null);
    }
    
    const handleFormKeyDown = (e) => {
        switch (e.key) {
            case 'Escape':
                handleUpdate(null);
                break;
            default:
                break;
        }
    }

    const onSubmit = (e) => {
        e.preventDefault();

        const data = {
            title: localTitle,
            description: localDescription,
        }
        handleUpdate(data);
    }

    return (
        <Form 
            className='d-flex justify-content-between w-100'
            onSubmit={onSubmit}>
            <div className='flex-grow-1'>
            <Form.Control
                type='text'
                value={localTitle || ''}
                onChange={(e) => setLocalTitle(e.target.value)}
                onKeyDown={handleFormKeyDown}
                // onBlur={() => setEditing(null)}
                placeholder='Title'
                autoFocus
                />
            <Form.Control
                as='textarea'
                value={localDescription || ''}
                onChange={(e) => setLocalDescription(e.target.value)}
                onKeyDown={handleFormKeyDown}
                placeholder='Description'
                />
            </div>
            <div>
            <Button onClick={handleCancel} onKeyDown={handleFormKeyDown} variant='danger' className='round-button-sm mx-2'>✗</Button>
            <Button type='submit' onKeyDown={handleFormKeyDown} variant='success' className='round-button-sm mx-2'>✓</Button>
            </div>
        </Form>
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
        <ListGroup.Item as={Alert} variant='primary' className='list-container'>
            <Alert.Heading>Loading...</Alert.Heading>
            <Spinner animation='border' variant='primary' />
        </ListGroup.Item>
    )
}

// An empty error item
function TodoError({error}) {
    return (
        <ListGroup.Item as={Alert} variant='danger' className='list-container'>
            <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
            <p>{error?.message}</p>
        </ListGroup.Item>
    )
}

const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function TrashCan({onDelete}) {
    const {themeContrast1} = useContext(ThemeContext);
    const { setActive } = useContext(ActiveContext);
    // const { setActive, setFormAction } = useContext(TodoAPIContext);
    const [canDrop, setCanDrop] = useState(false);

    const [{_canDrop, extraClass}, dropRef] = useDrop(() => ({
        accept: [ItemTypes.CARD, ItemTypes.CardCompleted],
        drop: (item, monitor) => {
            setActive(null);
            onDelete(item);
        },
        collect: monitor => ({
            _canDrop: monitor.canDrop(),
            extraClass: monitor.canDrop() ? 'expandPoint' : 'collapsePoint',
        }),
    }), [onDelete]);

    useEffect(() => {
        if (_canDrop) {
            setCanDrop(true);
        }
        else{
            timeout(300).then(() => setCanDrop(false))
        }
    }, [_canDrop]);


    return (
        <Button hidden={!canDrop} ref={dropRef} className={`round-button pos-bl ${extraClass}`} variant="primary">
            <Image src={`/todos/trashcan.png`} width={55} height={55} />
            {/* <span style={{paddingBottom: 10}} className={`text-${themeContrast1}`}>🗑</span> */}
        </Button>
    );
}