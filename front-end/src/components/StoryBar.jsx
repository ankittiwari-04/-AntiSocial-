import { useEffect, useState } from "react";
import API from "../api/axios";

export default function StoryBar() {
  const [storiesByUser, setStoriesByUser] = useState([]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await API.get("/stories/feed");
        setStoriesByUser(res.data || []);
      } catch {
        setStoriesByUser([]);
      }
    };
    fetchStories();
  }, []);

  return (
    <div className="card card-hover mb-4 p-3 animate-fade-in">
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <button type="button" className="min-w-[72px] shrink-0 text-center">
          <div className="story-ring animate-pulse-ring mx-auto inline-block rounded-full p-[2px]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dark-900 bg-dark-800 text-lg text-brand-400">
              +
            </div>
          </div>
          <p className="mt-1 truncate text-xs text-[#71717a]">Add</p>
        </button>
        {storiesByUser.map((entry, idx) => (
          <button key={entry.user?.id ?? entry.user?._id} type="button" className="min-w-[72px] shrink-0 text-center">
            <div className={idx % 2 === 0 ? "story-ring mx-auto rounded-full" : "story-ring-seen mx-auto rounded-full"}>
              <img
                src={entry.user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(entry.user?.username || "s")}`}
                alt=""
                className="h-14 w-14 rounded-full border-2 border-dark-900 object-cover"
              />
            </div>
            <p className="mt-1 truncate text-xs text-[#71717a]">{entry.user?.username}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
