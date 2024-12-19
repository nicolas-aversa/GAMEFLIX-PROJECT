import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, userType }) => {
  const { isAuthenticated, userType: authUserType } = useContext(AuthContext);

  if (!isAuthenticated || (userType && userType !== authUserType)) {
    return <Navigate to="/error403" />;
  }

  return children;
};

export default ProtectedRoute;