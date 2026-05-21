import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function CreatePost({ onPost, communityId }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState("");
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const fileRef = useRef(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  const handleMedia = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setMedia(file);
    setPreview(URL.createObjectURL(file));
  };

  const getAICaptions = async () => {
    if (!content.trim()) return;
    setAiLoading(true);
    const loadToast = toast.loading("Generating AI captions...");
    try {
      const res = await API.post("/ai/caption", { topic: content, tone: "casual" });
      setCaptions(res.data.captions || []);
      toast.success("AI Captions generated!", { id: loadToast });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate AI captions", { id: loadToast });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !media) return;
    setLoading(true);
    const loadToast = toast.loading("Publishing post...");
    try {
      const form = new FormData();
      form.append("content", content);
      if (media) form.append("media", media);
      if (communityId) form.append("communityId", communityId);
      const res = await API.post("/posts", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onPost?.(res.data);
      setContent("");
      setMedia(null);
      setCaptions([]);
      if (preview) URL.revokeObjectURL(preview);
      setPreview("");
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Post published successfully!", { id: loadToast });
    } catch (err) {
      toast.error(err.response?.data?.message || "Post failed", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  const seed = encodeURIComponent(user?.username || "user");

  return (
    <div className="card card-hover mb-4 animate-fade-in p-4">
      <div className="flex gap-3">
        <img
          src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
          alt=""
          className="avatar h-10 w-10 flex-shrink-0 border border-dark-500"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            rows={3}
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-white outline-none placeholder:text-[#52525b]"
          />

          {preview && (
            <div className="relative mt-2 overflow-hidden rounded-xl">
              {media?.type?.startsWith("video") ? (
                <video src={preview} controls className="max-h-64 w-full object-cover" />
              ) : (
                <img src={preview} alt="" className="max-h-64 w-full rounded-xl object-cover" />
              )}
              <button
                type="button"
                onClick={() => {
                  setMedia(null);
                  setPreview("");
                }}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs text-white transition-all hover:bg-black"
              >
                ✕
              </button>
            </div>
          )}

          {captions.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-[#52525b]">✨ AI Suggestions</p>
              {captions.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setContent(c)}
                  className="block w-full rounded-xl border border-brand-500/20 bg-brand-500/10 px-3 py-2.5 text-left text-sm text-brand-400 transition-all hover:border-brand-500/40 hover:bg-brand-500/20"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="divider my-3" />

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost text-sm">
            Photo
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost text-sm">
            Video
          </button>
          <button type="button" onClick={getAICaptions} disabled={aiLoading} className="btn-primary px-4 py-2 text-sm">
            {aiLoading ? "Thinking…" : "AI Caption"}
          </button>
          <button type="button" onClick={() => setContent((v) => `${v} #`)} className="btn-ghost text-sm">
            Hashtag
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleMedia} className="hidden" />
        </div>
        <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary text-sm">
          {loading ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}
