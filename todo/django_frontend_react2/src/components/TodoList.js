import { useState } from 'react';
import { Alert, Button, Card, Container, ListGroup } from 'react-bootstrap';

export default function TodoList({ list, updateItem, deleteItem, ...rest }) {
    const [active, setActive] = useState(null);

    const {theme, themeContrast1, themeContrast2} = rest;

    const onCheck = (todo, e) => {
        const data = {...todo, completed: e.target.checked};
        updateItem(todo.id, data);
    };

    const onSelect = (id) => {
        active === id ? setActive(null) : setActive(id);
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
                        <Card.Header className='d-flex justify-content-between' onClick={() => onSelect(todo.id)}>
                            <span>{todo.title}</span>
                            <input type='checkbox' checked={todo.completed} onChange={(e) => onCheck(todo, e)}/>
                        </Card.Header>
                        <Card.Body as={Alert} show={active == todo.id} variant={themeContrast2}>
                            <Card.Text>{todo.description}</Card.Text>
                            <Card.Text>{todo.private ? 'Private' : 'Public'}</Card.Text>
                            <Container className='d-flex justify-content-between'>
                                <Button variant='primary' size='sm'>Edit</Button>
                                <Button variant='danger' size='sm' onClick={() => deleteItem(todo.id)}>Delete</Button>
                            </Container>
                        </Card.Body>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
}

// function AddForm({user, addTodo}) {
//     const todoTitle = useRef();
//     const todoDesc = useRef();
//     const todoPriv = useRef();

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         axios.post(`${endpoint}/api/todo/`, {
//             title: todoTitle.current.value,
//             description: todoDesc.current.value,
//             private: todoPriv.current.checked,
//         }, {
//             headers: { 'Content-Type': 'application/json' }
//         })
//         .then(({data}) => addTodo(data))
//         .then(() => e.target.reset())
//         .catch((err) => console.log(err));
//     };

//     if (user) {
//         return (
//             <div className='container'>
//                 <h2>Add Todo</h2>
//                 <form onSubmit={handleSubmit}>
//                     <p>
//                         <label htmlFor="Title">Title: </label>
//                         <input type='text' ref={todoTitle} />
//                     </p>
//                     <p>
//                         <label htmlFor="Description">Description: </label>
//                         <input type='text' ref={todoDesc} />
//                     </p>
//                     <p>
//                         <label htmlFor="Private">Private: </label>
//                         <input type='checkbox' ref={todoPriv} />
//                     </p>
//                     <button type="submit">Submit</button>
//                 </form>
//             </div>
//         );
//     }
//     return (
//         <div>
//             <h2>Must be logged in to submit</h2>
//         </div>
//     );
// }