import Navbar from '../components/navbar';
import AdminSidebar from '../components/adminSidebar';
import { Outlet } from 'react-router-dom';
import '../styles/admin.css';

const AdminLayout = () => {
  return (
    <div className="admin-wrapper">
      <Navbar />
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
