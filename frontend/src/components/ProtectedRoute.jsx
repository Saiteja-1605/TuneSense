import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Disc3 } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Disc3 className="w-10 h-10 text-purple-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Tuning your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
