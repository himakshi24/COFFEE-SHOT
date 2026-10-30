import React from 'react'
import './Navbar.css' 
import logo from '../Assets/logo.png'
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const { pathname } = useLocation()
  const activeMenu = pathname === '/' ? 'home' : pathname.slice(1)

  return (
    <div>
      <div className='navbar'>
        <div className="nav-logo">
          <img src={logo} alt="Logo"/>
          <p>COFFEE SHOT</p>
        </div>
        <ul className='nav-menu'>
          <li><Link style={{ textDecoration: 'none' }} to = '/'>Home</Link>{activeMenu === 'home' ? <hr/> : <></>}</li>
          <li><Link style={{ textDecoration: 'none' }} to = '/menu'>Menu</Link>{activeMenu === 'menu' ? <hr/> : <></>}</li>
          <li><Link style={{ textDecoration: 'none' }} to = '/events'>Events</Link>{activeMenu === 'events' ? <hr/> : <></>}</li>
          <li><Link style={{ textDecoration: 'none' }} to = '/contact'>Contact</Link>{activeMenu === 'contact' ? <hr/> : <></>}</li>
        </ul>
        <div className="nav-login-cart">
          <Link to='/login'><button>Login</button></Link>
        </div>
      </div>
    </div>
  )
}

export default Navbar
