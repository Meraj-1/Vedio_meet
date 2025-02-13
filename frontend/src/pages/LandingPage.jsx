import React from 'react'
import "../App.css"
import assets from '../assets/assets'
import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div className='landingPageContainer'>
       <nav>
        <div className='navHeader'><h2>Me Vedio Call</h2></div>
        <div className='navlist'>
          <p>Join as Guest</p>
          <p>Register</p>
         <div>
          <button>
            Login
          </button>
         </div>
        </div>
       </nav>
       <div className='landingMainContainer'>
       <div>
        <h1><span style={{color: "#FF9839"}}>Connect</span> with your loved Ones</h1>
         <p>Cover a distance by Us</p>
         <div role='button'>
          <Link to={"/home"}>Get Started</Link>
         </div>
       </div>
       <div>
        <img src={assets.mobile} alt=''/>
       </div>
       </div>
    </div>
  )
}

export default LandingPage