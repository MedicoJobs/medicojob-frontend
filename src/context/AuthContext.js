import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,
    id: user.id || user._id,
    _id: user._id || user.id,
    specialization: user.specialization || '',
    phone: user.phone || '',
    bio: user.bio || '',
    skills: user.skills || [],
    preferredLocations: user.preferredLocations || [],
    experience: user.experience || 0,
    licenseNumber: user.licenseNumber || '',
    verified: Boolean(user.verified),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token) {
        if (savedUser) {
          setUser(normalizeUser(JSON.parse(savedUser)));
        }
        
        try {
          const res = await axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const normalized = normalizeUser(res.data);
          setUser(normalized);
          localStorage.setItem('user', JSON.stringify(normalized));
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    const normalized = normalizeUser(userData);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    const normalized = normalizeUser(userData);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
