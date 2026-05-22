import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import TipModal from "./TipModal";

function highlightHashtags(text) {
  if (!text) return null;
  return text.split(/(#[a-zA-Z0-9_]+)/g).map((part, idx) =>
    part.startsWith("#") ? (
      <span key={`${idx}-${part}`} className="text-brand-400">
        {part}
      </span>
    ) : (
      <span key={`${idx}-t`}>{part}</span>
    )
  );
}

function authorId(author) {
  if (!author) return null;
  return author.id ?? author._id;
}

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const uid = user?.id ?? user?._id;
  const author = post.userId;
  const aid = authorId(author);
  const likeIds = (post.likes || []).map((l) => (typeof l === "string" ? l : l?.id ?? l?._id));
  const [liked, setLiked] = useState(uid && likeIds.includes(uid));
  const [likeAnim, setLikeAnim] = useState(false);
  const [likesCount, setLikesCount] = useState(likeIds.length);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const isOnline = aid && onlineUsers.includes(aid);
  const isPremiumLocked = post.isPremium && aid !== uid;

  const handleLike = async () => {
    const res = await API.put(`/posts/${post.id ?? post._id}/like`);
    setLiked(res.data.liked);
    setLikesCount(res.data.likesCount);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 300);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await API.post(`/posts/${post.id ?? post._id}/comment`, { text: comment });
    setComment("");
    setShowComments(true);
    onUpdate?.();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this post?');
    if (!confirmed) return;
    
    const postId = post.id || post._id;
    console.log('Deleting post with ID:', postId);
    
    try {
      const res = await API.delete(`/posts/${postId}`);
      console.log('Delete response:', res.data);
      toast.success('Post deleted! 🗑️');
      onUpdate?.();
    } catch (err) {
      console.error('Delete failed:', err.response?.data);
      toast.error(
        err.response?.data?.message || 'Failed to delete post'
      );
    }
  };

  const pid = post.id ?? post._id;

  return (
    <article className="card card-hover mb-4 overflow-hidden p-4 animate-fade-in">
      <div className="mb-3 flex items-center justify-between">
        <Link to={`/profile/${aid}`} className="flex items-center gap-3">
          <div className="relative">
            <img
              src={author?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author?.username || "u")}`}
              alt=""
              className="avatar h-11 w-11 border border-dark-500"
            />
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-dark-950 bg-green-500" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {author?.username}
              {author?.isVerified && <span className="ml-1 text-brand-400">✓</span>}
            </p>
            <p className="text-xs text-[#71717a]">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}</p>
          </div>
        </Link>
        {(user?._id === post.userId || 
          user?.id === post.userId ||
          user?._id === post.userId?._id ||
          user?.id === post.userId?.id) && (
          <button 
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 
                       text-sm transition-all">
            Delete
          </button>
        )}
      </div>

      {post.content && <p className="mb-3 text-sm leading-relaxed text-zinc-200">{highlightHashtags(post.content)}</p>}

      <div className="relative overflow-hidden rounded-xl border border-dark-700">
        {post.mediaType === "image" && post.image && (
          <img src={post.image} alt="" className={`max-h-[500px] w-full object-cover ${isPremiumLocked ? "blur-md" : ""}`} />
        )}
        {post.mediaType === "video" && post.video && (
          <div className="relative">
            <video src={post.video} controls className={`max-h-[500px] w-full ${isPremiumLocked ? "blur-md" : ""}`} />
            <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
              Video
            </span>
          </div>
        )}
        {isPremiumLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
            Unlock for ₹99
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#a1a1aa]">
        <button
          type="button"
          onClick={handleLike}
          className={`btn-ghost flex items-center gap-1 px-0 ${liked ? "text-red-400" : ""} ${likeAnim ? "animate-bounce-heart" : ""}`}
        >
          <span>{liked ? "♥" : "♡"}</span>
          <span>{likesCount}</span>
        </button>
        <button type="button" onClick={() => setShowComments((v) => !v)} className="btn-ghost px-0">
          Comment {(post.comments || []).length}
        </button>
        <button type="button" className="btn-ghost px-0">
          Share
        </button>
        {uid !== aid && (
          <button type="button" onClick={() => setShowTip(true)} className="btn-ghost ml-auto px-0 text-amber-400 hover:text-amber-300">
            Tip
          </button>
        )}
      </div>

      {showComments && (
        <div className="mt-3 space-y-2 border-t border-dark-700 pt-3">
          {(post.comments || []).map((c) => (
            <div key={c.id ?? `${c.text}-${c.userId}`} className="rounded-lg bg-dark-700 px-3 py-2 text-xs text-zinc-200">
              <span className="font-semibold text-white">{c.userId?.username || "user"}: </span>
              {c.text}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleComment} className="mt-3 flex gap-2">
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Reply…"
          className="input-field flex-1 rounded-full py-2"
        />
        <button type="submit" className="btn-primary shrink-0 px-4 py-2 text-sm">
          Send
        </button>
      </form>

      {showTip && <TipModal receiverId={aid} receiverName={author?.username} onClose={() => setShowTip(false)} />}
    </article>
  );
}
