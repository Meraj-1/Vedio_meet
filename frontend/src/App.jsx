// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import {Routes, Route, BrowserRouter } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthenticationPage from './pages/AuthenticationPage'
import { AuthProvider } from './context/AuthContext'
import VedioMeet from './pages/VedioMeet'

function App() {

  return (
    <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/auth" element={<AuthenticationPage/>}/>
        <Route path="/:url" element={<VedioMeet/>} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
