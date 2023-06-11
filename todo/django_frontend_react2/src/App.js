import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './App.css';


import Content from './routes/Content';
import { Root } from './routes/root';

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            {
                path: ":user",
                element: <Content />,
            },
            {
                path: ":user/:id",
                element: <Content />,
            }
            ]
    },
  ]);


export function App() {

    return (

        <RouterProvider router={router} />
    );
}
