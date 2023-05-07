import axios from 'axios';
import React, { useEffect, useState } from 'react';
// import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import Login from './components/Login';
import TodoList from './components/TodoList';

const endpoint = process.env.REACT_APP_TODO_ENDPOINT;

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
    <div className="container">
      <TodoList user={user}/>
      <Login user={user} onUserChange={getUser} />
    </div>
  );
}

