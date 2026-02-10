import { useAuth } from '../context/authContext';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Debug logs
  console.log('PrivateRoute Check:', {
    user: user,
    localStorageToken: localStorage.getItem('token'),
    localStorageUser: localStorage.getItem('user'),
    currentPath: location.pathname
  });

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;