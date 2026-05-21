import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";

export default function CommunityDetail() {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);

  const load = async () => {
    const res = await API.get(`/communities/${id}`);
    setCommunity(res.data.community);
    setPosts(res.data.posts || []);
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!community) {
    return (
      <div className="card p-6">
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="card card-hover overflow-hidden p-0">
        <div className="h-32 w-full bg-gradient-brand bg-cover bg-center" />
        <div className="p-5">
          <h1 className="text-2xl font-bold text-white">{community.name}</h1>
          <p className="mt-2 text-sm text-[#a1a1aa]">{community.description}</p>
          <p className="mt-2 text-xs text-[#52525b]">Members: {community.members?.length ?? 0}</p>
          <button type="button" onClick={async () => { await API.put(`/communities/${id}/join`); await load(); }} className="btn-outline mt-4 text-sm">
            Join / Leave
          </button>
        </div>
      </div>
      <CreatePost communityId={id} onPost={(p) => setPosts((prev) => [p, ...prev])} />
      {posts.map((post) => (
        <PostCard key={post.id ?? post._id} post={post} onUpdate={load} />
      ))}
    </div>
  );
}
