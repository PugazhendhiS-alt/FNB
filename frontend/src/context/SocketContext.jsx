import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../api/endpoints';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socket) socket.disconnect();
      setSocket(null);
      setNotifications([]);
      return;
    }

    const token = localStorage.getItem('token');
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    newSocket.on('connect', () => {
      newSocket.emit('join-user-room', user.id);
      if (user.restaurantId) newSocket.emit('join-restaurant-room', user.restaurantId);
      if (user.buildingId) newSocket.emit('join-building-room', user.buildingId);
    });

    newSocket.on('new-notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    setSocket(newSocket);

    notificationAPI.getAll().then((res) => {
      setNotifications(res.data);
    }).catch(() => {});

    return () => { newSocket.disconnect(); };
  }, [user]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications, markAsRead, markAllAsRead, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
