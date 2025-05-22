import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import PrivateRoute from './components/privateRoute';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Settings from './pages/settings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Only include existing routes */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
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
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;