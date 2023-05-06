import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import './App.css';

axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

// const reducer = (state, action) => {
//   switch (action.type) {
//     case 'complete':
//       return state.map((todo) => {
//         if (todo.id === action.id) {
//           return { ...todo, completed: !todo.completed };
//         } else {
//           return todo;
//         }
//       });
//     default:
//       throw Error("Unexpected action");
//   }
// };

export function App() {
  // State
  const [todos, setTodos] = useState([]);
  const [user, _setUser] = useState("");
  // const [todos, dispatch] = useReducer(reducer, []);

  // Bindings
  const todoText = useRef();
  const todoDesc = useRef();
  const todoPriv = useRef();

  // Lifecycle
  useEffect(() => {
    refreshData();
    setUser(localStorage.getItem("user"));
  }, []);

  const refreshData = () => {
    axios.get('http://localhost:8000/api/todo/', {
      headers: { 'Content-Type': 'application/json' } 
    }).then(({data}) => setTodos(data));
  };

  const setUser = (user) => {
    _setUser(user);
    refreshData();
  };

  const toggleTodo = (e) => {
    // console.log(e);
    let id = e.target.id;
    // console.log(id);
    // console.log(typeof(id));
    const newTodos = todos.map((todo) => {
      // console.log(todo);
      if (todo.id == id) {
        // axios.patch(`http://localhost:8000/api/todo/${id}/`, {
        //   completed: !todo.completed
        // }, {
        //   headers: { 'Content-Type': 'application/json' }
        // }).then(({data}) => console.log(data));
        return { ...todo, completed: !todo.completed };
      } else {
        return todo;
      }
    });
    // console.log(newTodos);
    setTodos(newTodos);
  };


  // Event handlers
  const addTodo = async (title, body, priv) => {
    const data = {
      title: title,
      description: body,
      private: priv,
    }
    await axios.post('http://localhost:8000/api/todo/', data, {
      headers: {'Content-Type': 'application/json'}
    })
      .then(({data}) => {
        setTodos([...todos, data]);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addTodo(
      todoText.current.value,
      todoDesc.current.value,
      todoPriv.current.checked
      );
    e.target.reset();
  };
 
  return (
    <div>
      <ul>
        {todos.map((obj) => (
          <li key={obj.id}>
            {obj.title}
          <input id={obj.id} type="checkbox" checked={obj.completed} onChange={toggleTodo} />
          <input type="checkbox" />
          </li>
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
      </form>
      <Test user={user} onUserChange={setUser} />
    </div>
  );
}

export function Test ({user, onUserChange}) {

  // State
  // const [user, setUser] = useState("");

  // Bindings
  const Username = useRef();
  const Password = useRef();

  // Lifecycle
  // useEffect(() => {
  //   onUserChange(localStorage.getItem("user"));
  // }, []);

  const loginSubmit = (e) => {
    e.preventDefault();
    const fdata = new FormData();
    const user = Username.current.value;
    fdata.append('username', user);
    fdata.append('password', Password.current.value);
    axios.post('http://localhost:8000/api-auth/login/', fdata, {})
      .then(data => console.log(data))
      .then(() => localStorage.setItem("user", user))
      .then(() => onUserChange(user));
  };

  const logoutSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8000/accounts/logout/', {}, {})
      .then(data => console.log(data))
      .then(() => localStorage.setItem("user", ""))
      .then(() => onUserChange(""));
  };

  if (user) {
    return (
      <div>
        <h1>Hello {user}</h1>
        <form onSubmit={logoutSubmit}>
          <button type="submit">Logout</button>
        </form>
      </div>
    );
  }


  return (
    <div>
      <form onSubmit={loginSubmit}>
        <p>
          <label htmlFor="Username">Username: </label>
          <input type="text" ref={Username} />
        </p>
        <p>
          <label htmlFor="Password">Password: </label>
          <input type="text" ref={Password} />
        </p>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}


