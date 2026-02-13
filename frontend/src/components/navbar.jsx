import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import '../styles/navbar.css'; // Import the navbar styles

const Navbar = ({ onSidebarToggle }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen(!open);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div className="container">
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-secondary d-lg-none"
            aria-label="Toggle sidebar"
            onClick={() => onSidebarToggle && onSidebarToggle()}
            title="Toggle sidebar"
          >
            <i className="fas fa-bars"></i>
          </button>

          <Link className="navbar-brand ms-1" to="/">
            <span className="brand-text">TASKFLOW</span>
          </Link>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="main-nav"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={toggle}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="main-nav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={() => setOpen(false)}>HOME</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/features" onClick={() => setOpen(false)}>FEATURES</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about" onClick={() => setOpen(false)}>ABOUT</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact" onClick={() => setOpen(false)}>CONTACT</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/faq" onClick={() => setOpen(false)}>FAQ</Link>
            </li>
            {user?.role !== 'admin' && (
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard" onClick={() => setOpen(false)}>DASHBOARD</Link>
              </li>
            )}
            {user?.role === 'admin' && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin" onClick={() => setOpen(false)}>ADMIN</Link>
              </li>
            )}
          </ul>

          <div className="d-flex">
            {user ? (
              <>
                <span className="nav-link welcome-text me-3">Welcome, {user.email}</span>
                <button className="btn btn-danger" onClick={logout}>LOGOUT</button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-primary me-2" to="/login" onClick={() => setOpen(false)}>
                  LOGIN
                </Link>
                <Link className="btn btn-primary" to="/register" onClick={() => setOpen(false)}>
                  REGISTER
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;