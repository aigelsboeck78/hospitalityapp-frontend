import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SocketProvider } from './contexts/SocketContext'
import { API_ENDPOINTS } from './config/api'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import PropertyForm from './pages/PropertyForm'
import Guests from './pages/Guests'
import GuestForm from './pages/GuestForm'
import Activities from './pages/Activities'
import ActivityForm from './pages/ActivityForm'
import StreamingServices from './pages/StreamingServices'
import StreamingServicesEnhanced from './pages/StreamingServicesEnhanced'
import StreamingServiceForm from './pages/StreamingServiceForm'
import BackgroundImages from './pages/BackgroundImages'
import Settings from './pages/Settings'
import ShopMoments from './pages/ShopMoments'
import Events from './pages/Events'
import Dining from './pages/Dining'
import DiningForm from './pages/DiningForm'
import PropertyInformation from './pages/PropertyInformation'
import PropertyDevices from './pages/PropertyDevices'
import PropertyDevicesMDM from './pages/PropertyDevicesMDM'
import MDMDashboard from './pages/MDMDashboard'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and validate token
    const validateAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.VERIFY, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Network error or invalid token, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    validateAuth();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Routes>
      <Route path="/login" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>;
  }

  return (
    <SocketProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/new" element={<PropertyForm />} />
          <Route path="/properties/:id/edit" element={<PropertyForm />} />
          <Route path="/properties/:propertyId/guests" element={<Guests />} />
          <Route path="/properties/:propertyId/guests/new" element={<GuestForm />} />
          <Route path="/properties/:propertyId/guests/:id/edit" element={<GuestForm />} />
          <Route path="/properties/:propertyId/activities" element={<Activities />} />
          <Route path="/properties/:propertyId/activities/new" element={<ActivityForm />} />
          <Route path="/properties/:propertyId/activities/:id/edit" element={<ActivityForm />} />
          <Route path="/properties/:propertyId/streaming" element={<StreamingServicesEnhanced />} />
          <Route path="/properties/:propertyId/streaming/new" element={<StreamingServiceForm />} />
          <Route path="/properties/:propertyId/streaming/:id/edit" element={<StreamingServiceForm />} />
          <Route path="/properties/:propertyId/backgrounds" element={<BackgroundImages />} />
          <Route path="/properties/:propertyId/shop" element={<ShopMoments />} />
          <Route path="/properties/:propertyId/information" element={<PropertyInformation />} />
          <Route path="/properties/:propertyId/devices" element={<PropertyDevices />} />
          <Route path="/properties/:propertyId/mdm" element={<PropertyDevicesMDM />} />
          <Route path="/properties/:propertyId/mdm-dashboard" element={<MDMDashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/dining" element={<Dining />} />
          <Route path="/dining/new" element={<DiningForm />} />
          <Route path="/dining/:id/edit" element={<DiningForm />} />
          <Route path="/properties/:propertyId/dining" element={<Dining />} />
          <Route path="/properties/:propertyId/dining/new" element={<DiningForm />} />
          <Route path="/properties/:propertyId/dining/:id/edit" element={<DiningForm />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </SocketProvider>
  )
}

export default App