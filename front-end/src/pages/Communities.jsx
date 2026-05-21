import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Communities() {
  const { user } = useAuth();
  const uid = user?.id ?? user?._id;
  const [communities, setCommunities] = useState([]);
  const [joined, setJoined] = useState(() => new Set());

  const load = async () => {
    const res = await API.get("/communities");
    setCommunities(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleJoin = async (id) => {
    await API.put(`/communities/${id}/join`);
    setJoined((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">Communities</h1>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {communities.map((c) => (
          <div
            key={c.id ?? c._id}
            className={`card card-hover overflow-hidden p-0 ${joined.has(c.id ?? c._id) ? "ring-2 ring-brand-500/50" : ""}`}
          >
            <div className="h-28 w-full bg-gradient-brand bg-cover bg-center" />
            <div className="p-4">
              <Link to={`/communities/${c.id ?? c._id}`} className="text-lg font-bold text-white hover:text-brand-400">
                {c.name}
              </Link>
              <p className="mt-1 text-sm text-[#71717a]">{c.members?.length ?? 0} members</p>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-300">{c.description || "No description"}</p>
              <button type="button" onClick={() => toggleJoin(c.id ?? c._id)} className="btn-outline mt-4 text-sm">
                {joined.has(c.id ?? c._id) ? "Leave" : "Join"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {uid && (
        <button
          type="button"
          className="btn-primary fixed bottom-24 right-4 z-30 shadow-glow md:bottom-8"
          aria-label="Create community"
        >
          + Create
        </button>
      )}
    </div>
  );
}
