import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

export function useOrderTracking() {
  const { socket } = useSocket();
  const [activeOrderUpdate, setActiveOrderUpdate] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      setActiveOrderUpdate(data);
    };

    socket.on('order-status-changed', handler);
    return () => socket.off('order-status-changed', handler);
  }, [socket]);

  const clearUpdate = useCallback(() => setActiveOrderUpdate(null), []);

  return { activeOrderUpdate, clearUpdate };
}
