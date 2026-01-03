import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // Requirement: Check for valid user session
  if (!user) {
    // Redirect to login but save the current location so we can go back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}