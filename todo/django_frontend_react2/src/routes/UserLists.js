import { useEffect, useState } from 'react';
import { Button, Form, ListGroup } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useTodoAPI } from '../API/Hooks';
import LoadingErrorFrame from '../components/LoadingErrorFrame';

export default function UserLists() {
    const { user } = useParams();
    const { maps, addMap, updateMap } = useTodoAPI();
    const {data, isLoading, isError, error} = maps;

    const [editing, setEditing] = useState(null); // [editing, setEditing
    const [name, setName] = useState('');

    useEffect(() => {
        if (editing) {
            const list = data.find((item) => item.id === editing);
            setName(list.name);
        }
    }, [editing, data]);

    const handleUpdate = () => {
        updateMap({id: editing, name: name});
        setEditing(null);
    }

    const handleAdd = () => {
        addMap({})
            .then(({data}) => {
                console.log(data);
                setEditing(data.id);
            });
    }

    return (
        <LoadingErrorFrame
            isLoading={isLoading}
            isError={isError}
            error={error}
        >
            <ListGroup>
                <ListGroup.Item variant='primary'>Lists</ListGroup.Item>

                {data && data.map((item) => (
                    <ListGroup.Item key={item.id} className='d-flex justify-content-between' >
                        {
                            editing === item.id ?
                            <Form.Control
                                type='text'
                                value={name || ''}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => {
                                    switch (e.key) {
                                        case 'Enter':
                                            handleUpdate();
                                            break;
                                        case 'Escape':
                                            setEditing(null);
                                            break;
                                        default:
                                            break;
                                    }
                                }}
                                // onBlur={() => setEditing(null)}
                                autoFocus
                            />
                            :
                            <Form.Text className='text-muted'>{item.name}</Form.Text>
                        }
                        <Form.Group controlId='formBasicCheckbox' className='d-flex'>
                            {
                                editing === item.id ?
                                <>
                                <Button onClick={() => setEditing(null)} variant='danger' className='round-button-sm mx-2'>✗</Button>
                                <Button onClick={handleUpdate} variant='success' className='round-button-sm mx-2'>✓</Button>
                                </>
                                :
                                <>
                                <Button onClick={() => setEditing(item.id)} variant='warning' className='round-button-sm mx-2'>✎</Button>
                                <Button as={Link} to={`/${user}/${item.id}`} variant='primary' className='round-button-sm mx-2'>⮞</Button>
                                </>
                            }
                        </Form.Group>
                    </ListGroup.Item>
                ))}
                <ListGroup.Item className='d-flex justify-content-center'>
                    <Button onClick={handleAdd} variant='success' className='round-button-sm mx-2'>+</Button>
                </ListGroup.Item>
            </ListGroup>
        </LoadingErrorFrame>

    );
}
