import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <aside className="admin-sidebar">
      <h2 className="admin-sidebar-title">Admin</h2>
      <nav className="admin-nav">
        <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>
          User & Access
        </NavLink>
        <NavLink to="/admin/security" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>
          Security
        </NavLink>
        <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>
          System Config
        </NavLink>
        <NavLink to="/admin/audit" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>
          Audit Log
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
