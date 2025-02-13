// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import {Routes, Route, BrowserRouter } from 'react-router-dom'
import LandingPage from './pages/LandingPage'

function App() {

  return (
    <BrowserRouter>
    {/* <Router> */}
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
      </Routes>
    {/* </Router> */}
    </BrowserRouter>
  )
}

export default App
