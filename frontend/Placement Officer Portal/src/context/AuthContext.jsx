import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem('placement_access');
    const storedUser = localStorage.getItem('placementUser');
    if (access && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      const userData = res.data.user;
      
      if (userData.role !== 'placement_officer' && userData.role !== 'admin') {
        return { success: false, message: 'Access denied: Students cannot access Placement Officer Portal.' };
      }
      
      localStorage.setItem('placement_access', res.data.access);
      localStorage.setItem('placement_refresh', res.data.refresh);
      localStorage.setItem('placementUser', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { 
        success: false, 
        message: err.response?.data?.detail || 'Invalid email or password.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('placement_access');
    localStorage.removeItem('placement_refresh');
    localStorage.removeItem('placementUser');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
