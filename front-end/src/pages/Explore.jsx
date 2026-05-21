import { useEffect, useState } from "react";
import API from "../api/axios";

const filters = ["all", "photos", "videos", "people", "communities"];

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      const type = filter === "videos" ? "video" : undefined;
      const res = await API.get(`/posts/explore${type ? `?type=${type}` : ""}`);
      setPosts(res.data || []);
    };
    if (filter !== "people") load();
  }, [filter]);

  const searchPeople = async () => {
    if (!query.trim()) return;
    const res = await API.get(`/users/search/${encodeURIComponent(query)}`);
    setUsers(res.data || []);
    setFilter("people");
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people or hashtags"
            className="input-field flex-1"
          />
          <button type="button" onClick={searchPeople} className="btn-primary shrink-0">
            Search
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                filter === f ? "bg-gradient-brand text-white" : "btn-ghost border border-dark-500"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="mb-3 text-sm font-semibold text-white">Trending hashtags</h3>
        <div className="flex flex-wrap gap-3 text-sm text-[#a1a1aa]">
          {["#design", "#ai", "#startup", "#creator", "#dev"].map((tag, i) => (
            <span key={tag} className="rounded-lg bg-dark-700 px-3 py-1">
              {tag}{" "}
              <span className="text-[#52525b]">({12 + i * 7})</span>
            </span>
          ))}
        </div>
      </div>

      {filter === "people" ? (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id ?? u._id} className="card card-hover flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <img
                  src={u.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.username)}`}
                  alt=""
                  className="avatar h-10 w-10 border border-dark-500"
                />
                <div>
                  <p className="text-sm font-semibold text-white">@{u.username}</p>
                  <p className="text-xs text-[#71717a]">{u.bio || "No bio"}</p>
                </div>
              </div>
              <button type="button" className="btn-outline px-3 py-1.5 text-xs">
                Follow
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="columns-2 gap-3 md:columns-3">
          {posts.map((p) => (
            <div key={p.id ?? p._id} className="mb-3 break-inside-avoid overflow-hidden rounded-xl border border-dark-700 bg-dark-800">
              {p.mediaType === "video" && p.video ? (
                <video src={p.video} controls className="w-full" />
              ) : (
                <img
                  src={p.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(p.id || "e")}`}
                  alt=""
                  className="w-full"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
