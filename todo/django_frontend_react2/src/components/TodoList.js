import { useContext, useEffect, useState } from 'react';
import { Alert, Button, Container, Form, Image, ListGroup, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { useDrop } from 'react-dnd';
import { Link } from 'react-router-dom';
import { AuthContext } from '../API/Auth';
import { useAPITodoItem } from '../API/Hooks';
import { ItemTypes } from '../Constants';
import { ThemeContext } from '../context/Contexts';
import { ListItemDragDropFrame } from './DragDrop';
import FlippableButton from './FlippableButton';
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
        if (data != null) await addItem(data);
        setAdding(false);
    }

    const onDrop = (item1, item2) => {
        swapItems(item1.id, item2.id);
    }

    const getTitle = () => {
        if (id === undefined) return 'Lists';
        if (id === 'fav') return 'Favorites';
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
    const { 
        id, title, description, completed,
        count_childrens, count_completed,
     } = item || {};

     const [mode, setMode] = useState(null);
     const [badgeColor, setBadgeColor] = useState('warning'); 

     const [localTitle, setLocalTitle] = useState('');
     const [localDescription, setLocalDescription] = useState('');

     useEffect(() => {
        setLocalTitle(title);
    }, [title]);

    useEffect(() => {
        setLocalDescription(description);
    }, [description]);

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

    const handelEscape = () => {
        if (handleAdd !== undefined) {
            handleAdd(null);
        }
        setMode(null);
    }

    const _handleUpdate = () => {
        const data = {
            title: localTitle,
            description: localDescription,
        }
        if (handleAdd !== undefined) {
            handleAdd(data);
        } else {
            handleUpdate({id, ...data});
        }
        setMode(null);
    }

    const handleFormKeyDown = (e) => {
        switch (e.key) {
            case 'Enter':
                _handleUpdate();
                break;
            case 'Escape':
                handelEscape(null);
                setMode(null);
                break;
            default:
                break;
        }
    }

    const buttonArrayEdit = () => (
        <>
        <Button onClick={() => setMode(null)} onKeyDown={handleFormKeyDown} variant='danger' className='round-button-sm mx-2'>✗</Button>
        <Button onClick={_handleUpdate} onKeyDown={handleFormKeyDown} variant='success' className='round-button-sm mx-2'>✓</Button>
        </>
    )
    const buttonArrayNormal = () => (
        <>
        <Button onClick={() => setMode('edit')} variant='warning' className='round-button-sm mx-2'>✎</Button>
        {/* <Button as={Link} to={`/${user}/${id}`} variant={badgeColor} className='round-button-sm mx-2'>➤</Button> */}
        </>
    )
    const getButtonArray = () => {
        if (mode === 'edit' || id === undefined) return buttonArrayEdit();
        return buttonArrayNormal();
    }

    const renderDescription = () => {
        if (mode !== null) return (<></>)

        return (
            <Tooltip id='tooltip-description' placement='bottom' className='in' style={{opacity: 1}}>
                <div className='tooltip-inner'>
                    {description}
                </div>
            </Tooltip>
        )
    }

    return (
        <>

        <ListGroup.Item 
            className={`d-flex justify-content-between px-0 ${completed ? 'todo-completed' : ''}`}
            >

            {
                mode === 'edit' || id === undefined ?
                <Container>
                    <Form.Control
                        type='text'
                        value={localTitle || ''}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        onKeyDown={handleFormKeyDown}
                        // onBlur={() => setEditing(null)}
                        autoFocus
                        />
                    <Form.Control
                        type='textarea'
                        value={localDescription || ''}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        onKeyDown={handleFormKeyDown}
                        placeholder='Description'
                        />
                </Container>
                :
                <>
                    <Form.Text className='text-muted'>
                        <Container
                            className={`bg-${badgeColor} m-0 px-2 py-2`}
                            bg={badgeColor}
                            as={Link} to={`/${user}/${id}`}
                            style={{borderRadius: 5}}
                            />
                        <CompletedButton item={item} handleUpdate={handleUpdate} />
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
                    </Form.Text>
                </>

            }
          
            <Form.Group controlId='formButtonArray' className='d-flex'>
                {getButtonArray()}
            </Form.Group>
        </ListGroup.Item>
        </>
     )
}

function CompletedButton({item, handleUpdate}) {
    const { completed } = item || {};

    const handleAsync = () => {
        handleUpdate({id: item.id, completed: !completed});
    }

    return (
        <FlippableButton
            completed={completed}
            offState='✗'
            onState='✓'
            onVariant='success'
            handleAsync={handleAsync}
            />
    )
}

function FavoriteButton({item, handleUpdate}) {
    const { favorite } = item || {};

    const handleAsync = () => {
        handleUpdate({id: item.id, favorite: !favorite});
    }

    return (
        <FlippableButton
            completed={favorite}
            offState={<Image src={`/todos/star.png`} width={16} height={16} />}
            onState={<Image src={`/todos/star-full.png`} width={16} height={16} />}
            handleAsync={handleAsync}
            />
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
            <Image src={`/todos/trashcan.png`} width={55} height={55} />
            {/* <span style={{paddingBottom: 10}} className={`text-${themeContrast1}`}>🗑</span> */}
        </Button>
    );
}