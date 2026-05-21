import { useState, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import Messages from "./pages/Messages";
import Communities from "./pages/Communities";
import CommunityDetail from "./pages/CommunityDetail";
import Notifications from "./pages/Notifications";
import LiveStream from "./pages/LiveStream";
import NotFound from "./pages/NotFound";

const Protected = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function RightRail() {
  return (
    <aside className="sticky top-6 hidden h-fit w-[300px] shrink-0 space-y-4 rounded-2xl border border-dark-700 bg-dark-800 p-4 lg:block">
      <h3 className="text-sm font-semibold text-white">Who to follow</h3>
      {["nova", "ryan.codes", "mira.design"].map((u) => (
        <div key={u} className="flex items-center justify-between rounded-xl bg-dark-700 p-3">
          <div>
            <p className="text-sm font-semibold">@{u}</p>
            <p className="text-xs text-[#a1a1aa]">Creator</p>
          </div>
          <button type="button" className="btn-outline px-3 py-1 text-xs">
            Follow
          </button>
        </div>
      ))}
      <h3 className="pt-2 text-sm font-semibold text-white">Trending</h3>
      {["#buildinpublic", "#ai", "#mern", "#design"].map((tag) => (
        <div key={tag} className="rounded-lg px-2 py-1 text-sm text-[#a1a1aa] hover:bg-dark-700">
          {tag}
        </div>
      ))}
    </aside>
  );
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-dark-950 pb-24 pt-4 md:pb-6 md:pl-64 md:pt-6">
      <Navbar />
      <div className="mx-auto flex max-w-6xl gap-6 px-4">
        <main className="min-w-0 flex-1 animate-fade-in lg:max-w-2xl">{children}</main>
        <RightRail />
      </div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#050508] flex items-center 
                    justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold gradient-text mb-3">
          AntiSocial
        </h1>
        <div className="w-8 h-8 border-2 border-brand-500 
                        border-t-transparent rounded-full 
                        animate-spin mx-auto"/>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
        <Route path="/" element={<Protected><AppLayout><Home /></AppLayout></Protected>} />
        <Route path="/profile/:id" element={<Protected><AppLayout><Profile /></AppLayout></Protected>} />
        <Route path="/explore" element={<Protected><AppLayout><Explore /></AppLayout></Protected>} />
        <Route path="/messages" element={<Protected><AppLayout><Messages /></AppLayout></Protected>} />
        <Route path="/messages/:userId" element={<Protected><AppLayout><Messages /></AppLayout></Protected>} />
        <Route path="/communities" element={<Protected><AppLayout><Communities /></AppLayout></Protected>} />
        <Route path="/communities/:id" element={<Protected><AppLayout><CommunityDetail /></AppLayout></Protected>} />
        <Route path="/notifications" element={<Protected><AppLayout><Notifications /></AppLayout></Protected>} />
        <Route path="/live" element={<Protected><AppLayout><LiveStream /></AppLayout></Protected>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
