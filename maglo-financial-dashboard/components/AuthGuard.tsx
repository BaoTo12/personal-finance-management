import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to sign in, replacing the current history entry
      // Pass the current location in state so we can redirect back after login if needed
      navigate('/auth/signin', { 
        replace: true,
        state: { from: location } 
      });
    }
  }, [isAuthenticated, navigate, location]);

  // If not authenticated, prevent rendering children to avoid flash of protected content
  if (!isAuthenticated) return null;

  return <>{children}</>;
};