import React from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Routes } from 'react-router'
import Clients from './pages/Clients'
import AddClient from './pages/AddClient'
import ClientDetail from './pages/ClientDetail'
import AddPayment from './pages/AddPayment'
import MainLayout from './layout/MainLayout'
import { StoreProvider } from './store'

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<MainLayout/>}>
      <Route path="/" element={<Clients />} />
      <Route path="/clients/new" element={<AddClient />} />
      <Route path="/clients/:id" element={<ClientDetail />} />
      <Route path="/payments/new" element={<AddPayment />} />
    </Route>

    )
  )
  return (
    <StoreProvider>
    <RouterProvider router={router}/>
    </StoreProvider>
  )
}

export default App
