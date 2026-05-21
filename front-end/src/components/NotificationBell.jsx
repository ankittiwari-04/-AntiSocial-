import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useSocket } from "../context/SocketContext";

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [shake, setShake] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/notifications");
        setUnread((res.data || []).filter((n) => !n.isRead).length);
      } catch {
        setUnread(0);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const onNew = () => {
      setUnread((u) => u + 1);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    };
    socket.on("newNotification", onNew);
    return () => socket.off("newNotification", onNew);
  }, [socket]);

  return (
    <Link
      to="/notifications"
      className={`badge border border-dark-500 bg-dark-800 text-[#a1a1aa] transition-colors hover:border-brand-500/40 hover:text-white ${
        shake ? "animate-bounce-heart" : ""
      }`}
    >
      <span>◎</span>
      <span>Alerts</span>
      {unread > 0 && <span className="rounded-full bg-red-500 px-1.5 text-[10px] text-white">{unread}</span>}
    </Link>
  );
}
