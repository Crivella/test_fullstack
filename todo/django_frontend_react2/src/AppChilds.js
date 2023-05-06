import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import TodoList from './components/TodoList';

const endpoint = process.env.REACT_APP_TODO_ENDPOINT;
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.withCredentials = true

export function App() {
  // State
  const [user, setUser] = useState("");

  // Lifecycle
  useEffect(() => {
    getUser();
    // setUser(localStorage.getItem("user"));
  }, []);

  const getUser = async () => {
    await axios.get(`${endpoint}/accounts/get-user/`, {})
      .then(({data}) => {
        // console.log(data);
        setUser(data.username);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="App">
      <TodoList user={user}/>
      <Login user={user} onUserChange={getUser} />
    </div>
  );
}

export function Login ({user, onUserChange}) {
  const Username = useRef();
  const Password = useRef();

  const loginSubmit = async (e) => {
    e.preventDefault();
    const uname = Username.current.value;
    const passd = Password.current.value;
    // e.target.reset();

    if (user) return;
    if (!uname) return;
    if (!passd) return;
    
    const fdata = new FormData();
    fdata.append('username', uname);
    fdata.append('password', passd);
    await axios.post(`${endpoint}/accounts/login/`, fdata, {})
      .catch((err) => console.log(err));
    onUserChange()
  };

  const logoutSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${endpoint}/accounts/logout/`, {}, {})
    onUserChange()
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