import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {

  // State
  const [todos, setTodos] = useState([]);

  // Bindings
  const todoText = useRef();

  // Lifecycle
  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem('todos'));
    if (todos) {
      setTodos(todos);
    }
  }, []);

  // Event handlers
  const addTodo = e => {
    e.preventDefault();
    const newTodo = todoText.current.value;
    const next = [...todos, newTodo]
    setTodos(next);
    e.target.reset();
    localStorage.setItem('todos', JSON.stringify(next));
  }

  let hello = 'hello';
  return (
    <div>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>{todo}</li>
        ))}
      </ul>

      <form onSubmit={addTodo}>
        <input ref={todoText} /> 
        <button type="submit">Add Todo</button>
      </form>
    </div>
  );
}

export default App;
