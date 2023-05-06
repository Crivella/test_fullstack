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
    setUser(localStorage.getItem("user"));
  }, []);

  return (
    <div className="App">
      <TodoList user={user}/>
      <Login user={user} onUserChange={setUser} />
    </div>
  );
}

export function Login ({user, onUserChange}) {
  const Username = useRef();
  const Password = useRef();

  const loginSubmit = (e) => {
    e.preventDefault();
    const uname = Username.current.value;
    const passd = Password.current.value;
    e.target.reset();
    console.log("loginSubmit1");
    console.log(user);
    if (user) return;
    console.log("loginSubmit2");
    
    const fdata = new FormData();
    console.log("loginSubmit3");
    console.log(uname);
    console.log(passd);
    if (!uname) return;
    console.log("loginSubmit4");
    if (!passd) return;
    console.log("loginSubmit5");
    
    fdata.append('username', uname);
    fdata.append('password', passd);
    axios.post(`${endpoint}/accounts/login/`, fdata, {})
      .then(obj => obj.status == 200 ? onUserChange(uname) : obj.data)
      .then(data => console.log(data))
      .then(() => localStorage.setItem("user", uname))
      .then(() => onUserChange(uname));
  };

  const logoutSubmit = (e) => {
    e.preventDefault();
    axios.post(`${endpoint}/accounts/logout/`, {}, {})
      .then(obj => obj.status == 200 ? onUserChange("") : obj.data)
      .then(data => console.log(data))
      .then(() => localStorage.setItem("user", ""))
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
                <div>
                  <h1>Hello {user}</h1>
                  <form onSubmit={logoutSubmit}>
                    <button type="submit">Logout</button>
                  </form>
              </div>
    </div>
  );
}