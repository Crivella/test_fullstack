import { useEffect, useState } from 'react';
import { Button, Form, ListGroup } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useAPITodoItem } from '../API/Hooks';
import '../components/ExtraButtons.css';
import LoadingErrorFrame from '../components/LoadingErrorFrame';

export default function UserLists() {
    const { user, id } = useParams();
    const { 
        title, description, completed,
        list, count, countCompleted,
        addItem, deleteItem, updateItem,
        loading, error
     } = useAPITodoItem(id);

    const [editing, setEditing] = useState(null); // [editing, setEditing
    const [deleting, setDeleting] = useState(null); // [editing, setEditing
    const [localTitle, setTitle] = useState('');

    useEffect(() => {
        if (editing) {
            const app = list.find((item) => item.id === editing);
            setTitle(app.title);
        }
    }, [editing, list]);

    const handleUpdate = () => {
        updateItem({id: editing, title: localTitle});
        setEditing(null);
    }

    const handleAdd = async () => {
        const data = await addItem({});
        setEditing(data.id);
    }

    const handleDelete = () => {
        deleteItem({id: deleting});
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
            <Button as={Link} to={`/${user}/${item.id}`} variant='primary' className='round-button-sm mx-2'>⮞</Button>
            </>
        )
    const getButtonArray = (item) => {
        if (editing === item.id) return buttonArrayEdit(item);
        if (deleting === item.id) return buttonArrayDelete(item);
        return buttonArrayNormal(item);
    }

    return (
        <LoadingErrorFrame
            isLoading={loading}
            isError={error}
            error={error}
        >
            <ListGroup>
                <ListGroup.Item variant='primary'>
                    {title ? `${title} (${countCompleted}/${count})` : 'Lists'}
                </ListGroup.Item>
                <ListGroup.Item className='d-flex justify-content-center'>
                    <Button onClick={handleAdd} variant='success' className='round-button-sm mx-2'>+</Button>
                </ListGroup.Item>

                {list.map((item) => (
                    <ListGroup.Item key={item.id} className='d-flex justify-content-between' >
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
                                    item.count_completed
                                    ?
                                    `(${item.count_completed} / ${item.count_childrens}) ${item.title}`
                                    :
                                    item.title
                                }
                            </Form.Text>
                        }
                        <Form.Group controlId='formBasicCheckbox' className='d-flex'>
                            {getButtonArray(item)}
                        </Form.Group>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </LoadingErrorFrame>

    );
}
