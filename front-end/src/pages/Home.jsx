import { useEffect, useState } from "react";
import API from "../api/axios";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import StoryBar from "../components/StoryBar";

function FeedSkeleton() {
  return (
    <div className="card mb-4 p-4">
      <div className="skeleton mb-3 h-4 w-1/3" />
      <div className="skeleton mb-2 h-3 w-full" />
      <div className="skeleton h-52 w-full" />
    </div>
  );
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useAI, setUseAI] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const endpoint = useAI ? "/ai/smart-feed" : "/posts/feed";
      const res = await API.get(endpoint);
      setPosts(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Home | AntiSocial';
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [useAI]);

  return (
    <div className="animate-fade-in">
      <StoryBar />
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-white">Your feed</h2>
        <button
          type="button"
          onClick={() => setUseAI((v) => !v)}
          className="btn-outline px-4 py-2 text-sm"
        >
          {useAI ? "AI ranked" : "Latest"}
        </button>
      </div>
      <CreatePost onPost={(p) => setPosts((prev) => [p, ...prev])} />
      {loading ? (
        <>
          <FeedSkeleton />
          <FeedSkeleton />
        </>
      ) : (
        posts.map((post) => <PostCard key={post.id ?? post._id} post={post} onUpdate={fetchFeed} />)
      )}
    </div>
  );
}
