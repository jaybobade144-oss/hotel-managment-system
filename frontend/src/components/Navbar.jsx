import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="container">
        <nav className="navbar">
          <Link to="/" className="logo">
            ROYAL<span>HAVEN</span>
          </Link>
          
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/rooms" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Rooms
              </NavLink>
            </li>
            
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <li>
                    <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                      Admin Panel
                    </NavLink>
                  </li>
                ) : (
                  <li>
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                      My Bookings
                    </NavLink>
                  </li>
                )}
                
                <li>
                  <span className="user-badge">
                    {user.name} ({user.role === 'admin' ? 'Admin' : 'Guest'})
                  </span>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      onLogout();
                      navigate('/login');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.1em' }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Login
                  </NavLink>
                </li>
                <li>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
