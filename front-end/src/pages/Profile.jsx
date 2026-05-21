import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const uid = user?.id ?? user?._id;
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("posts");
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");

  const load = async () => {
    const [uRes, pRes] = await Promise.all([API.get(`/users/${id}`), API.get(`/posts/user/${id}`)]);
    setProfile(uRes.data);
    setPosts(pRes.data || []);
    setBio(uRes.data.bio || "");
  };

  useEffect(() => {
    load();
  }, [id]);

  const visiblePosts = useMemo(() => {
    if (tab === "videos") return posts.filter((p) => p.mediaType === "video");
    if (tab === "liked") return posts.filter((p) => (p.likes || []).includes(uid));
    return posts;
  }, [posts, tab, uid]);

  const saveBio = async () => {
    await API.put(`/users/${id}`, { bio });
    setEditing(false);
    await load();
  };

  const followToggle = async () => {
    await API.put(`/users/${id}/follow`);
    await load();
  };

  if (!profile) {
    return (
      <div className="card p-6">
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  const isSelf = uid === id;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="card card-hover overflow-hidden p-0">
        <div className="h-44 w-full bg-gradient-brand bg-cover bg-center" />
        <div className="relative px-4 pb-4 pt-2">
          <img
            src={profile.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.username)}`}
            alt=""
            className="avatar absolute -top-12 left-4 h-24 w-24 border-4 border-dark-950"
          />
          <div className="ml-0 mt-14 flex flex-col gap-3 border-b border-dark-700 pb-4 md:ml-28 md:mt-0 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">@{profile.username}</h1>
              <p className="text-sm text-[#71717a]">{profile.website || "No website"}</p>
            </div>
            {isSelf ? (
              <button type="button" onClick={() => setEditing((v) => !v)} className="btn-outline shrink-0 self-start text-sm">
                Edit profile
              </button>
            ) : (
              <button type="button" onClick={followToggle} className="btn-primary shrink-0 self-start text-sm">
                Follow
              </button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-dark-700 p-3 text-center text-sm">
            <div>
              <p className="font-bold text-white">{posts.length}</p>
              <p className="text-xs text-[#71717a]">Posts</p>
            </div>
            <div>
              <p className="font-bold text-white">{Array.isArray(profile.followers) ? profile.followers.length : 0}</p>
              <p className="text-xs text-[#71717a]">Followers</p>
            </div>
            <div>
              <p className="font-bold text-white">{Array.isArray(profile.following) ? profile.following.length : 0}</p>
              <p className="text-xs text-[#71717a]">Following</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-start gap-2">
            <p className="flex-1 text-sm leading-relaxed text-zinc-200">{bio || "No bio yet."}</p>
            {isSelf && (
              <button type="button" onClick={async () => {
                try {
                  const res = await API.post("/ai/bio");
                  if (res.data?.bio) setBio(res.data.bio);
                } catch {
                  window.alert("AI bio unavailable");
                }
              }} className="btn-primary px-3 py-1.5 text-xs">
                AI Bio
              </button>
            )}
          </div>

          {isSelf && editing && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input value={bio} onChange={(e) => setBio(e.target.value)} className="input-field flex-1" maxLength={150} />
              <button type="button" onClick={saveBio} className="btn-primary shrink-0">
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { id: "posts", label: "Posts" },
            { id: "videos", label: "Videos" },
            { id: "liked", label: "Liked" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                tab === t.id ? "bg-gradient-brand text-white shadow-glow-sm" : "btn-ghost border border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {visiblePosts.map((p) => (
            <div key={p.id ?? p._id} className="overflow-hidden rounded-xl border border-dark-700 bg-dark-800">
              {p.mediaType === "video" && p.video ? (
                <video src={p.video} className="h-36 w-full object-cover" muted playsInline />
              ) : (
                <img
                  src={p.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(p.id || "p")}`}
                  alt=""
                  className="h-36 w-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
