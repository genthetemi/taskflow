import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">TaskFlow</Link>
        <div className="d-flex">
          {user ? (
            <button className="btn btn-danger" onClick={logout}>Logout</button>
          ) : (
            <Link className="btn btn-primary" to="/login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; // Ensure default export!