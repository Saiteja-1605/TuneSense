import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tunesense_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('tunesense_token'));
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Verify active token on mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          localStorage.setItem('tunesense_user', JSON.stringify(userData));
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('tunesense_token', data.access_token);
    localStorage.setItem('tunesense_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    showToast(`Welcome back, ${data.user.name}!`, 'success');
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authApi.register({ name, email, password });
    localStorage.setItem('tunesense_token', data.access_token);
    localStorage.setItem('tunesense_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    showToast('Account created successfully! Preferences initialized.', 'success');
    return data;
  };

  const logout = () => {
    localStorage.removeItem('tunesense_token');
    localStorage.removeItem('tunesense_user');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
