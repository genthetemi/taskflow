import { useAuth } from '../context/authContext';
import { Navigate } from 'react-router-dom';

// Use default export
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;