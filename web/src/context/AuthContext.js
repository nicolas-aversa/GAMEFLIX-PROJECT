import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    let storedUser = null;
    
    // Debug logs
    console.log('Token from localStorage:', token);
    console.log('UserType from localStorage:', storedUserType);
    console.log('Raw user data from localStorage:', localStorage.getItem('user'));
  
    try {
      storedUser = JSON.parse(localStorage.getItem('user'));
      console.log('Parsed user data:', storedUser);
    } catch (error) {
      console.error('Failed to parse user data from localStorage:', error);
      localStorage.removeItem('user');
    }
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (token, type, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', type);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUserType(type);
    setUser(userData);
    console.log('Logged in user:', userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserType(null);
    setUser(null);
    console.log('User logged out');
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userType, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;