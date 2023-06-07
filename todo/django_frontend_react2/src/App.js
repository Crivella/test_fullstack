import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './App.css';


import { Root } from './routes/root';
import UserLists from './routes/UserLists';

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            {
                path: ":user",
                element: <UserLists />,
            },
            {
                path: ":user/:id",
                element: <UserLists />,
            }
            ]
    },
  ]);


export function App() {

    return (

        <RouterProvider router={router} />
    );
}
