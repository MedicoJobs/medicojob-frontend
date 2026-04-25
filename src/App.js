import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorDashboard from './pages/DoctorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import JobListings from './pages/JobListings';
import JobDetails from './pages/JobDetails';
import PostJob from './pages/PostJob';
import ApplicationsTracking from './pages/ApplicationsTracking';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';

import { SOCKET_URL } from './utils/api';
export const socket = io(SOCKET_URL);

function StartupRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) {
      return;
    }

    hasRun.current = true;

    const token = localStorage.getItem('token');
    if (!token && location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}

function App() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    socket.on('newJob', (job) => {
      setNotification({ title: 'New Job Posted!', message: `${job.title} in ${job.location}`, type: 'success' });
    });

    socket.on('applicationUpdate', (data) => {
      setNotification({ title: 'Application Update', message: `Your application status changed to: ${data.status}`, type: 'info' });
    });

    return () => {
      socket.off('newJob');
      socket.off('applicationUpdate');
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <StartupRedirect />
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Landing />} />
              <Route path="/jobs" element={<JobListings />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              
              {/* Protected Routes - Common */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              } />

              {/* Protected Routes - Applicant */}
              <Route path="/doctor/dashboard" element={
                <ProtectedRoute allowedRoles={['applicant', 'doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />

              {/* Protected Routes - Hospital */}
              <Route path="/hospital/dashboard" element={
                <ProtectedRoute allowedRoles={['hospital']}>
                  <HospitalDashboard />
                </ProtectedRoute>
              } />
              <Route path="/hospital/post-job" element={
                <ProtectedRoute allowedRoles={['hospital']}>
                  <PostJob />
                </ProtectedRoute>
              } />
              <Route path="/hospital/jobs/:jobId/applications" element={
                <ProtectedRoute allowedRoles={['hospital']}>
                  <ApplicationsTracking />
                </ProtectedRoute>
              } />
            </Routes>
          </main>

          {notification && (
            <NotificationToast 
              notification={notification} 
              onClose={() => setNotification(null)} 
            />
          )}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
