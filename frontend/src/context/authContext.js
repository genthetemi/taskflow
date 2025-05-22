import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      return (savedUser && token) ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const login = async (token, userData) => {
    try {
      // Store both token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      console.log('Auth state updated:', {
        token: !!token,
        user: !!userData,
        storedToken: !!localStorage.getItem('token'),
        storedUser: !!localStorage.getItem('user')
      });
    } catch (error) {
      console.error('Error updating auth state:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Monitor auth state changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    console.log('Auth state check:', {
      hasToken: !!token,
      hasUser: !!savedUser,
      currentUser: !!user
    });

    if (!token || !savedUser) {
      setUser(null);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);