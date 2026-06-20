import React, { createContext, useCallback, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

export const AuthContext = createContext();

const safeString = (value) => (typeof value === 'string' ? value : '');
const safeArray = (value) => (Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []);
const safeNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
const sanitizeResumeAnalysis = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  return {
    candidate_summary: safeString(value.candidate_summary),
    resume_score: safeNumber(value.resume_score),
    seniority_level: safeString(value.seniority_level),
    experience_years: safeNumber(value.experience_years),
    specialization: safeString(value.specialization),
    recommended_roles: safeArray(value.recommended_roles),
    missing_information: safeArray(value.missing_information),
  };
};

const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') return null;

  const id = safeString(user.id || user._id);

  return {
    id,
    _id: id,
    name: safeString(user.name),
    email: safeString(user.email),
    role: safeString(user.role),
    profileImage: safeString(user.profileImage),
    resumeUrl: safeString(user.resumeUrl),
    specialization: safeString(user.specialization),
    phone: safeString(user.phone),
    bio: safeString(user.bio),
    skills: safeArray(user.skills),
    resumeAnalysis: sanitizeResumeAnalysis(user.resumeAnalysis),
    preferredLocations: safeArray(user.preferredLocations),
    experience: safeNumber(user.experience),
    licenseNumber: safeString(user.licenseNumber),
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
          console.error('Failed to refresh authenticated user profile.', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    const normalized = normalizeUser(userData);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    const normalized = normalizeUser(userData);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
  }, []);

  const contextValue = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    updateUser,
  }), [user, loading, login, logout, updateUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
