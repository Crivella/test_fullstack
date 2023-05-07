import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Container, ListGroup } from 'react-bootstrap';

const endpoint = process.env.REACT_APP_TODO_ENDPOINT;
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export default function TodoList({ user }) {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    refreshData();
    }, [user]);

    const refreshData = () => {
      axios.get(`${endpoint}/api/todo/`, {
        headers: { 'Content-Type': 'application/json' } 
      }).then(({data}) => setTodos(data));
    };

  const addTodo = (todo) => {
    setTodos([...todos, todo]);
  }

  const updateTodo = (todo, e) => {
    axios.patch(`${endpoint}/api/todo/` + todo.id + "/", 
      {...todo, completed: e.target.checked}
    )
      .then(() => todo.completed = !todo.completed)
      .then(() => setTodos([...todos]))
      .catch((e) => console.log('Cant edit todo while not logged in!'));
  }


  return (
    <Container className='py-2'>
      <ListGroup className='p-2 bg-dark text-white'>
          <ListGroup.Item className='list-group-item d-flex justify-content-between bg-primary text-white'>
            <span>Titles</span>
            <span>Completed</span>
          </ListGroup.Item>
          {todos.map((todo) => (
            // <Todo key={e.id} user={user} todo={e} updateTodo={updateTodo} />
            <ListGroup.Item key={todo.id} className='list-group-item d-flex justify-content-between'>
              <span>{todo.title}</span>
              <input type='checkbox' checked={todo.completed} onChange={(e) => updateTodo(todo, e)}/>
            </ListGroup.Item>
          ))}
        <AddForm user={user} addTodo={addTodo} />
      </ListGroup>
    </Container>
  );
}

function AddForm({user, addTodo}) {
  const todoTitle = useRef();
  const todoDesc = useRef();
  const todoPriv = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${endpoint}/api/todo/`, {
      title: todoTitle.current.value,
      description: todoDesc.current.value,
      private: todoPriv.current.checked,
    }, {
      headers: { 'Content-Type': 'application/json' }
    })
    .then(({data}) => addTodo(data))
    .then(() => e.target.reset())
    .catch((err) => console.log(err));
  };

  if (user) {
    return (
      <div className='container'>
        <h2>Add Todo</h2>
        <form onSubmit={handleSubmit}>
          <p>
            <label htmlFor="Title">Title: </label>
            <input type='text' ref={todoTitle} />
          </p>
          <p>
            <label htmlFor="Description">Description: </label>
            <input type='text' ref={todoDesc} />
          </p>
          <p>
            <label htmlFor="Private">Private: </label>
            <input type='checkbox' ref={todoPriv} />
          </p>
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
  return (
    <div>
      <h2>Must be logged in to submit</h2>
    </div>
  );
}