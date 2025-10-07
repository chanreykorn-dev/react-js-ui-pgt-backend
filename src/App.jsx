import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { CreateProduct } from './pages/product/CreateProduct';
import { SignIn } from './pages/sign-in/SignIn';
import RequireAuth from './auth/RequireAuth';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import { Gallery } from './components/Gallery';
import NotFound from './components/404';
import Banner from './pages/banner/Banner';
import { AddBanner } from './pages/banner/AddBanner';
import { EditBanner } from './pages/banner/EditBanner';
import Categories from './pages/categories/Categories';
import AddCategories from './pages/categories/AddCategories';
import EditCategories from './pages/categories/EditCategories';
import ChooseUs from './pages/choose-us/ChooseUs';
import AddChooseUs from './pages/choose-us/AddChoosUs';
import EditChooseUs from './pages/choose-us/EditChooseUs';
import Specification from './pages/specification/Specification';
import AddSpecification from './pages/specification/AddSpecification';
import EditSpecification from './pages/specification/EditSpecification';
import Mission from './pages/mission/Mission';
import AddMission from './pages/mission/AddMission';
import EditMission from './pages/mission/EditMission';
import Solution from './pages/solution/Solution';
import AddSolution from './pages/solution/AddSolution';
import EditSolution from './pages/solution/EditSolution';
import AddDevelopment from './pages/History of development/AddDevelopment';
import Development from './pages/History of development/Development';
import EditDevelopment from './pages/History of development/EditDevelopment';
import AddWelcome from './pages/Welcome/AddWelcome';
import EditWelcome from './pages/Welcome/EditWelcome';
import Welcome from './pages/Welcome/Welcome';
import Warranty from './pages/warranty/Warranty';
import AddWarranty from './pages/warranty/AddWarranty';
import EditWarranty from './pages/warranty/EditWarranty';
import User from './pages/users/User';
import AddUser from './pages/users/AddUser';
import EditUser from './pages/users/EditUser';
import Role from './pages/role/Role';
import AddRole from './pages/role/AddRole';
import EditRole from './pages/role/EditRole';
import CEO from './pages/ceo/CEO';
import AddCEO from './pages/ceo/AddCEO';
import EditCEO from './pages/ceo/EditCEO';
import Product from './pages/product/Product';
import AddProduct from './pages/product/AddProduct';
import EditProduct from './pages/product/EditProduct';
import Permission from './pages/permission/Permission';
import AddPermission from './pages/permission/AddPermission';
import EditPermission from './pages/permission/EditPermission';
import SetPermission from './pages/role-permissions/SetPermission';
import AssignUserPermissions from './pages/users/AssignUserPermissions';



export const App = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <RequireAuth><Layout /></RequireAuth>,
      children: ([
        {
          index: true,
          element: <Dashboard />
        },
        {
          path: '/dashboard',
          element: <CreateProduct />
        },
        {
          path: '/gallery',
          element: <Gallery />
        },
        {
          path: '/banners',
          element: <Banner />
        },
        {
          path: '/banners/add',
          element: <AddBanner />
        },
        {
          path: '/banners/edit/:id',
          element: <EditBanner />
        },
        {
          path: '/categories',
          element: <Categories />
        },
        {
          path: '/categories/add',
          element: <AddCategories />
        },
        {
          path: '/categories/edit/:id',
          element: <EditCategories />
        },
        {
          path: '/choose-us',
          element: <ChooseUs />
        },
        {
          path: '/choose-us/add',
          element: <AddChooseUs />
        },
        {
          path: '/choose-us/edit/:id',
          element: <EditChooseUs />
        },
        {
          path: '/specification',
          element: <Specification />
        },
        {
          path: '/specification/add',
          element: <AddSpecification />
        },
        {
          path: '/specification/edit/:id',
          element: <EditSpecification />
        },
        {
          path: '/mission',
          element: <Mission />
        },
        {
          path: '/mission/add',
          element: <AddMission />
        },
        {
          path: '/mission/edit/:id',
          element: <EditMission />
        },
        {
          path: '/solution',
          element: <Solution />
        },
        {
          path: '/solution/add',
          element: <AddSolution />
        },
        {
          path: '/solution/edit/:id',
          element: <EditSolution />
        },
        {
          path: '/development',
          element: <Development />
        },
        {
          path: '/development/add',
          element: <AddDevelopment />
        },
        {
          path: '/development/edit/:id',
          element: <EditDevelopment />
        },
        {
          path: '/welcome',
          element: <Welcome />
        },
        {
          path: '/welcome/add',
          element: <AddWelcome />
        },
        {
          path: '/welcome/edit/:id',
          element: <EditWelcome />
        },
        {
          path: '/warranty',
          element: <Warranty />
        },
        {
          path: '/warranty/add',
          element: <AddWarranty />
        },
        {
          path: '/warranty/edit/:id',
          element: <EditWarranty />
        },
        {
          path: '/users',
          element: <User />
        },
        {
          path: '/users/add',
          element: <AddUser />
        },
        {
          path: '/users/edit/:id',
          element: <EditUser />
        },
        {
          path: '/roles',
          element: <Role />
        },
        {
          path: '/roles/add',
          element: <AddRole />
        },
        {
          path: '/roles/edit/:id',
          element: <EditRole />
        },
        {
          path: '/ceo',
          element: <CEO />
        },
        {
          path: '/ceo/add',
          element: <AddCEO />
        },
        {
          path: '/ceo/edit/:id',
          element: <EditCEO />
        },
        {
          path: '/product',
          element: <Product />
        },
        {
          path: '/product/add',
          element: <AddProduct />
        },
        {
          path: '/product/edit/:id',
          element: <EditProduct />
        },
        {
          path: '/permission',
          element: <Permission />
        },
        {
          path: '/permission/add',
          element: <AddPermission />
        },
        {
          path: '/permission/edit/:id',
          element: <EditPermission />
        },
        {
          path: '/role/:roleId/permissions',
          element: <SetPermission />
        },
        {
          path: '/users/:userId/permissions',
          element: <AssignUserPermissions />
        },
      ])
    },
    {
      path: 'login',
      element: <SignIn />
    },
    {
      path: '*',
      element: <NotFound />
    }

  ])

  return (
    <RouterProvider router={router} />
  )
};
