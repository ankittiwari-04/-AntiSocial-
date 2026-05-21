import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const uid = user?.id ?? user?._id;
  const { socket, onlineUsers } = useSocket();
  const [inbox, setInbox] = useState([]);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  const peerFromInbox = useMemo(() => {
    const row = inbox.find((m) => {
      const s = m.senderId?.id ?? m.senderId?._id ?? m.senderId;
      const r = m.receiverId?.id ?? m.receiverId?._id ?? m.receiverId;
      return s === userId || r === userId;
    });
    if (!row) return null;
    const s = row.senderId?.id ?? row.senderId?._id ?? row.senderId;
    return s === uid ? row.receiverId : row.senderId;
  }, [inbox, userId, uid]);

  const loadInbox = async () => {
    const res = await API.get("/messages");
    setInbox(res.data || []);
  };

  const loadThread = async (targetId) => {
    const res = await API.get(`/messages/${targetId}`);
    setThread(res.data || []);
  };

  useEffect(() => {
    document.title = 'Messages | AntiSocial';
    loadInbox();
  }, []);

  useEffect(() => {
    if (userId) loadThread(userId);
  }, [userId]);

  useEffect(() => {
    if (!socket) return undefined;
    const onNew = (msg) => {
      const sid = msg.senderId?.id ?? msg.senderId;
      const rid = msg.receiverId?.id ?? msg.receiverId;
      if (sid === userId || rid === userId) setThread((prev) => [...prev, msg]);
    };
    const onTyping = ({ senderId }) => {
      if (senderId === userId) {
        setTyping(true);
        setTimeout(() => setTyping(false), 1000);
      }
    };
    socket.on("newMessage", onNew);
    socket.on("userTyping", onTyping);
    return () => {
      socket.off("newMessage", onNew);
      socket.off("userTyping", onTyping);
    };
  }, [socket, userId]);

  const send = () => {
    if (!text.trim() || !userId || !socket) return;
    socket.emit("sendMessage", { senderId: uid, receiverId: userId, text });
    setThread((prev) => [...prev, { senderId: uid, receiverId: userId, text, id: `tmp-${Date.now()}` }]);
    setText("");
  };

  const peerId = peerFromInbox?.id ?? peerFromInbox?._id ?? userId;
  const peerOnline = peerId && onlineUsers.includes(peerId);

  return (
    <div className="grid min-h-[70vh] animate-fade-in grid-cols-1 gap-4 md:grid-cols-3">
      <aside className="card max-h-[70vh] overflow-y-auto p-3 md:col-span-1">
        <h2 className="mb-3 text-sm font-semibold text-white">Conversations</h2>
        <div className="space-y-2">
          {inbox.map((m) => {
            const s = m.senderId?.id ?? m.senderId?._id ?? m.senderId;
            const peer = s === uid ? m.receiverId : m.senderId;
            const pid = peer?.id ?? peer?._id;
            return (
              <Link
                key={m.id ?? `${pid}-${m.createdAt}`}
                to={`/messages/${pid}`}
                className="block rounded-xl border border-transparent bg-dark-700 p-3 transition-all hover:border-dark-500 hover:bg-dark-600"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">@{peer?.username}</span>
                  {pid && onlineUsers.includes(pid) && <span className="h-2 w-2 rounded-full bg-green-500" />}
                </div>
                <p className="truncate text-xs text-[#71717a]">{m.text || "Media"}</p>
              </Link>
            );
          })}
        </div>
      </aside>

      <section className="card flex max-h-[70vh] flex-col p-4 md:col-span-2">
        <div className="mb-3 border-b border-dark-700 pb-2 text-sm text-[#71717a]">
          {peerFromInbox ? (
            <span className="flex items-center gap-2 text-white">
              Chat with @{peerFromInbox.username}
              {peerOnline && <span className="badge bg-green-500/20 text-green-400">Online</span>}
            </span>
          ) : (
            "Select a conversation"
          )}
        </div>
        <div className="mb-3 flex-1 space-y-2 overflow-y-auto rounded-xl bg-dark-950/50 p-3">
          {thread.map((msg) => {
            const sid = msg.senderId?.id ?? msg.senderId?._id ?? msg.senderId;
            const mine = sid === uid;
            return (
              <div
                key={msg.id ?? `${msg.text}-${msg.createdAt}`}
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  mine ? "ml-auto bg-gradient-brand text-white shadow-glow-sm" : "bg-dark-700 text-zinc-100"
                }`}
              >
                {msg.text}
              </div>
            );
          })}
          {typing && (
            <div className="flex gap-1 rounded-2xl bg-dark-700 px-3 py-2 text-xs text-[#71717a]">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#71717a]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#71717a] [animation-delay:0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#71717a] [animation-delay:0.3s]" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              socket?.emit("typing", { senderId: uid, receiverId: userId });
            }}
            className="input-field flex-1 rounded-full py-2"
            placeholder="Message…"
          />
          <button type="button" onClick={send} className="btn-primary shrink-0 px-5">
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
