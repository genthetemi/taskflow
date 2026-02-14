import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import '../styles/navbar.css'; // Import the navbar styles

const Navbar = ({
  onSidebarToggle,
  notificationsCount = 0,
  notifications = [],
  isNotificationsLoading = false,
  onRespondInvitation
}) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const toggle = () => setOpen(!open);
  const getNavLinkClass = ({ isActive }) => `nav-link ${isActive ? 'active-link' : ''}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top">
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
          <ul className="navbar-nav me-auto ms-3">
            <li className="nav-item">
              <NavLink end className={getNavLinkClass} to="/" onClick={() => setOpen(false)}>HOME</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={getNavLinkClass} to="/features" onClick={() => setOpen(false)}>FEATURES</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={getNavLinkClass} to="/about" onClick={() => setOpen(false)}>ABOUT</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={getNavLinkClass} to="/contact" onClick={() => setOpen(false)}>CONTACT</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={getNavLinkClass} to="/faq" onClick={() => setOpen(false)}>FAQ</NavLink>
            </li>
            {user?.role !== 'admin' && (
              <li className="nav-item">
                <NavLink className={getNavLinkClass} to="/dashboard" onClick={() => setOpen(false)}>DASHBOARD</NavLink>
              </li>
            )}
            {user?.role === 'admin' && (
              <li className="nav-item">
                <NavLink className={getNavLinkClass} to="/admin" onClick={() => setOpen(false)}>ADMIN</NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex">
            {user ? (
              <>
                {
                  <button
                    className={`me-2 navbar-notifications-btn ${showNotificationsDropdown ? 'is-open' : ''}`}
                    onClick={() => setShowNotificationsDropdown((v) => !v)}
                    type="button"
                    aria-label="Open notifications"
                    aria-expanded={showNotificationsDropdown}
                    title="Notifications"
                  >
                    <i className="fas fa-bell"></i>
                  </button>
                }
                {showNotificationsDropdown && (
                  <div className="navbar-notifications-dropdown">
                    <div className="navbar-notifications-title">Board Invitations</div>
                    {isNotificationsLoading ? (
                      <div className="navbar-notification-empty">Loading invitations...</div>
                    ) : notifications.length === 0 ? (
                      <div className="navbar-notification-empty">No new notifications</div>
                    ) : (
                      notifications.map((invitation) => (
                        <div className="navbar-notification-item" key={invitation.id}>
                          <div className="navbar-notification-text">
                            <strong>{invitation.inviter_email}</strong> invited you to <strong>{invitation.board_name}</strong>
                          </div>
                          <div className="navbar-notification-actions">
                            <button
                              className="btn btn-sm btn-secondary"
                              type="button"
                              onClick={() => onRespondInvitation && onRespondInvitation(invitation.id, 'reject')}
                            >
                              Reject
                            </button>
                            <button
                              className="btn btn-sm btn-primary"
                              type="button"
                              onClick={() => onRespondInvitation && onRespondInvitation(invitation.id, 'accept')}
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
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