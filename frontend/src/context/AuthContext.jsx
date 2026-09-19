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
    let isMounted = true;
    const verifyAuth = async () => {
      if (token) {
        try {
          const userData = await authApi.getMe();
          if (isMounted) {
            setUser(userData);
            localStorage.setItem('tunesense_user', JSON.stringify(userData));
          }
        } catch (err) {
          // Only force logout if the server explicitly rejected the token as unauthorized (401)
          // Do NOT log out on network error, 502/503 cold start delays, or gateway timeouts
          if (err.response?.status === 401) {
            console.warn('Session expired or unauthorized (401):', err);
            if (isMounted) {
              logout();
            }
          } else {
            console.warn('Backend temporarily unreachable or warming up, keeping cached session:', err);
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };
    verifyAuth();
    return () => {
      isMounted = false;
    };
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

  const demoLogin = async () => {
    const data = await authApi.demo();
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
        demoLogin,
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
