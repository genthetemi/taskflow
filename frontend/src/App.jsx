import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import PrivateRoute from './components/privateRoute';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import Settings from './pages/settings';
import AdminLayout from './pages/adminLayout';
import AdminUsers from './pages/adminUsers';
import AdminSecurity from './pages/adminSecurity';
import AdminSettings from './pages/adminSettings';
import AdminAudit from './pages/adminAudit';
import Home from './pages/home';
import About from './pages/about';
import Features from './pages/features';
import AdminRoute from './components/adminRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="security" element={<AdminSecurity />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="audit" element={<AdminAudit />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;