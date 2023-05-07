import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';

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

  const TEST = () => {
    console.log(todos);
    setTodos(todos);
  };

  const addTodo = (todo) => {
    setTodos([...todos, todo]);
  }

  const updateTodo = (todo) => {
    setTodos([...todos]);
  }

  return (
    <div className='container pt-3 bg-dark text-white'>
      <h1>Todo List</h1>
      <ul className='list-group'>
        <div className='list-group-item d-flex justify-content-between bg-primary text-white'>
          <div>Titles</div>
          <div>Completed</div>
        </div>
        {todos.map((e) => (
          <Todo key={e.id} user={user} todo={e} updateTodo={updateTodo} />
        ))}
      </ul>
      <input type='checkbox' onChange={TEST} />
      <AddForm user={user} addTodo={addTodo} />
    </div>
  );
}

function Todo({user, todo, updateTodo}) {
  const [errCompleted, setErrCompleted] = useState(false) 
  useEffect(() => {
    // todo.title += "_test"
    // updateTodo(todo);
    // console.log(todo.id);
    }, []);

  const toggleCompleted = (e) => {
    // if (! user) return;
    axios.patch(`${endpoint}/api/todo/` + todo.id + "/", 
      {...todo, completed: e.target.checked})
    .then(() => todo.completed = !todo.completed)
    .then(() => updateTodo())
    .then(() => setErrCompleted(false))
    .catch(() => setErrCompleted(true));
  };

  return (
    <li className='list-group-item list-group-item-action d-flex justify-content-between'>
      {todo.title}
      <input type='checkbox' checked={todo.completed} onChange={toggleCompleted}/>
    </li>
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