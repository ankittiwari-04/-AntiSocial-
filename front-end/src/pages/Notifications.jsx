import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

export default function Notifications() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const res = await API.get("/notifications");
    setItems(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const today = [];
    const week = [];
    const earlier = [];
    const now = Date.now();
    items.forEach((n) => {
      const age = now - new Date(n.createdAt).getTime();
      if (age < 24 * 3600 * 1000) today.push(n);
      else if (age < 7 * 24 * 3600 * 1000) week.push(n);
      else earlier.push(n);
    });
    return { today, week, earlier };
  }, [items]);

  const markAllRead = async () => {
    await API.put("/notifications/read");
    await load();
  };

  const section = (title, list) => (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#52525b]">{title}</h3>
      {list.map((n) => (
        <div
          key={n.id ?? n._id}
          className={`card card-hover flex items-center justify-between gap-3 p-4 ${
            n.isRead ? "opacity-90" : "border-brand-500/30 bg-dark-700/80"
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <img
              src={n.senderId?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(n.senderId?.username || "n")}`}
              alt=""
              className="avatar h-10 w-10 border border-dark-500"
            />
            <div className="min-w-0">
              <p className="truncate text-sm text-white">
                <span className="font-semibold">@{n.senderId?.username}</span>{" "}
                <span className="text-[#a1a1aa]">{n.message || n.type}</span>
              </p>
              <p className="text-xs text-[#52525b]">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <img
            src={n.postId?.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(n.postId?.id || "p")}`}
            alt=""
            className="h-12 w-12 shrink-0 rounded-lg border border-dark-500 object-cover"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <button type="button" onClick={markAllRead} className="btn-outline text-sm">
          Mark all read
        </button>
      </div>
      {section("Today", grouped.today)}
      {section("This week", grouped.week)}
      {section("Earlier", grouped.earlier)}
    </div>
  );
}
