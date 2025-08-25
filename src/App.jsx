import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { CreateProduct } from './pages/product/CreateProduct';
import { SignIn } from './pages/sign-in/SignIn';
import RequireAuth from './auth/RequireAuth';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

export const App = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <RequireAuth><Layout /></RequireAuth>,
      children: ([
        {
          index: true,
          element: <CreateProduct />
        },
      ])
    },
    {
      path: 'login',
      element: <SignIn />
    },

  ])

  return (
    <RouterProvider router={router} />
  )
};
