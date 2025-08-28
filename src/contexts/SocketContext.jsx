import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
    
    const newSocket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      setConnectionError(null);
      // Only show toast in production or on first connection
      if (!window.location.hostname.includes('localhost')) {
        toast.success('Connected to real-time updates');
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      // Only show toast in production
      if (!window.location.hostname.includes('localhost')) {
        toast.error('Lost connection to real-time updates');
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Listen for guest events
    newSocket.on('guest.checked_in', (data) => {
      console.log('Guest checked in:', data);
      toast.success(`${data.guest.first_name} ${data.guest.last_name} has checked in`);
    });

    newSocket.on('guest.checked_out', (data) => {
      console.log('Guest checked out:', data);
      toast.success(`${data.guest.first_name} ${data.guest.last_name} has checked out`);
    });

    newSocket.on('guest.auto_checkout', (data) => {
      console.log('Automatic guest checkout:', data);
      toast.success(`${data.guest.first_name} ${data.guest.last_name} automatically checked out`);
    });

    newSocket.on('guest.deleted', (data) => {
      console.log('Guest deleted:', data);
      toast.info('Guest record has been deleted');
    });

    // Listen for session events
    newSocket.on('sessions.cleared', (data) => {
      console.log('Sessions cleared:', data);
      if (data.reason === 'automatic_cleanup') {
        toast.info(`${data.sessionIds.length} streaming sessions automatically cleared`);
      }
    });

    // Listen for cleanup events
    newSocket.on('cleanup.completed', (data) => {
      console.log('Cleanup completed:', data);
      toast.success(`Cleanup completed: ${data.successCount}/${data.processedCount} guests processed`);
    });

    // Listen for device events
    newSocket.on('device.status_changed', (data) => {
      console.log('Device status changed:', data);
    });

    setSocket(newSocket);

    return () => {
      // Only close if the socket is still connected
      // This prevents errors in React StrictMode where cleanup runs immediately
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, []);

  const joinProperty = (propertyId) => {
    if (socket && propertyId) {
      socket.emit('join_property', propertyId);
    }
  };

  const leaveProperty = (propertyId) => {
    if (socket && propertyId) {
      socket.emit('leave_property', propertyId);
    }
  };

  const value = {
    socket,
    isConnected,
    connectionError,
    joinProperty,
    leaveProperty,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};