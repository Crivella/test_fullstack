import axios from 'axios';
import React from 'react';
import './App.css';

axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export class App extends React.Component {


  render() { return (
  <div>
    {/* <ul>
      {todos.map((obj) => (
        <li key={obj.id}>{obj.title}</li>
      ))}
    </ul>

    <form onSubmit={handleSubmit}>
      <p>
        <label htmlFor="todoText">Todo Title: </label>
        <input type="text" ref={todoText} />
      </p>
      <p>
        <label htmlFor="todoDesc">Todo Description: </label>
        <input type="text" ref={todoDesc} />
      </p>
      <p>
        <label htmlFor="todoPriv">Private: </label>
        <input type="checkbox" ref={todoPriv} />
      </p>
      <button type="submit">Add Todo</button>
    </form> */}
  </div>
  )}
}

export class Test extends React.Component {
}
