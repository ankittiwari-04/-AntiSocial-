import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const uid = user?.id ?? user?._id;

  useEffect(() => {
    if (!uid) return undefined;
    const s = io("http://localhost:5000", { query: { userId: uid } });
    setSocket(s);
    s.on("onlineUsers", setOnlineUsers);

    return () => {
      s.off("onlineUsers", setOnlineUsers);
      s.close();
      setSocket(null);
    };
  }, [uid]);

  return <SocketContext.Provider value={{ socket, onlineUsers }}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);
