import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const navItems = [
  { to: "/", icon: "⌂", label: "Home" },
  { to: "/explore", icon: "⊕", label: "Explore" },
  { to: "/messages", icon: "✉", label: "Messages" },
  { to: "/communities", icon: "◈", label: "Communities" },
  { to: "/notifications", icon: "◎", label: "Notifications" },
  { to: "/live", icon: "▶", label: "Live" },
];

export default function Navbar() {
  const { user, dispatch } = useAuth();
  const navigate = useNavigate();
  const uid = user?.id ?? user?._id;

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-dark-700 bg-dark-900 p-4 md:flex">
        <div className="mb-6 px-2 py-4">
          <h1 className="gradient-text text-2xl font-bold tracking-tight">AntiSocial</h1>
          <p className="mt-0.5 text-xs text-[#52525b]">Be yourself, unapologetically.</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border border-dark-500 bg-dark-700 text-white"
                    : "text-[#71717a] hover:bg-dark-800 hover:text-white"
                }`
              }
            >
              <span className="w-5 text-center text-lg">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="mt-auto">
            <div className="mb-3 px-2">
              <NotificationBell />
            </div>
            <div className="divider mb-3" />
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-all hover:bg-dark-800"
              onClick={() => navigate(`/profile/${uid}`)}
            >
              <img
                src={
                  user.profilePicture ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username || "user")}`
                }
                alt=""
                className="avatar h-9 w-9 border border-dark-500"
              />
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold text-white">{user.username}</p>
                <p className="truncate text-xs text-[#52525b]">@{user.username}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={logout}
              className="mt-2 w-full rounded-xl px-4 py-2 text-left text-xs text-[#52525b] transition-all hover:bg-[#1a0a0a] hover:text-red-400"
            >
              Sign out
            </button>
          </div>
        )}
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-dark-700 bg-dark-900/95 px-2 py-3 backdrop-blur-xl md:hidden">
        {navItems.slice(0, 5).map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl px-3 py-1 text-xs transition-all duration-200 ${
                isActive ? "text-brand-400" : "text-[#52525b]"
              }`
            }
          >
            <span className="text-xl">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
        {user && (
          <NavLink
            to={`/profile/${uid}`}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl px-3 py-1 text-xs transition-all duration-200 ${
                isActive ? "text-brand-400" : "text-[#52525b]"
              }`
            }
          >
            <span className="text-xl">👤</span>
            <span>Profile</span>
          </NavLink>
        )}
      </nav>
    </>
  );
}
