import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) return;
    
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
                       'http://localhost:5000';
    
    const s = io(SOCKET_URL, {
      query: { userId: user._id },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    s.on('connect', () => console.log('Socket connected'));
    s.on('onlineUsers', setOnlineUsers);
    s.on('disconnect', () => console.log('Socket disconnected'));
    s.on('connect_error', (err) => console.log('Socket error:', err));
    
    setSocket(s);
    return () => s.close();
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
