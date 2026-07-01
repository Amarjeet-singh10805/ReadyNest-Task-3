import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, Search, PlusSquare, Heart, Bookmark, LogOut, Sun, Moon, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { useEffect } from "react";
import toast from "react-hot-toast";

const navItemClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
    isActive
      ? "font-semibold bg-gray-100 dark:bg-gray-900"
      : "hover:bg-gray-100 dark:hover:bg-gray-900"
  }`;

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications().catch(() => {});
  }, [fetchNotifications]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-gray-200 dark:border-gray-800 p-4 fixed h-screen">
        <h1 className="text-2xl font-bold mb-8 px-3 bg-gradient-to-r from-brand-500 to-purple-500 bg-clip-text text-transparent">
          InstaForge
        </h1>
        <nav className="flex flex-col gap-1 flex-1">
          <NavLink to="/" end className={navItemClass}>
            <Home size={22} /> Home
          </NavLink>
          <NavLink to="/search" className={navItemClass}>
            <Search size={22} /> Search
          </NavLink>
          <NavLink to="/create" className={navItemClass}>
            <PlusSquare size={22} /> Create
          </NavLink>
          <NavLink to="/notifications" className={navItemClass}>
            <Heart size={22} /> Notifications
            {unreadCount > 0 && (
              <span className="ml-auto bg-brand-500 text-white text-xs rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/saved" className={navItemClass}>
            <Bookmark size={22} /> Saved
          </NavLink>
          <NavLink to={`/profile/${user?.id}`} className={navItemClass}>
            <User size={22} /> Profile
          </NavLink>
        </nav>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-red-500"
        >
          <LogOut size={22} /> Logout
        </button>
      </aside>

      <main className="flex-1 md:ml-64 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 flex justify-around py-2 z-50">
        <NavLink to="/" end className="p-2">
          <Home size={24} />
        </NavLink>
        <NavLink to="/search" className="p-2">
          <Search size={24} />
        </NavLink>
        <NavLink to="/create" className="p-2">
          <PlusSquare size={24} />
        </NavLink>
        <NavLink to="/notifications" className="p-2 relative">
          <Heart size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-brand-500 w-2.5 h-2.5 rounded-full" />
          )}
        </NavLink>
        <NavLink to={`/profile/${user?.id}`} className="p-2">
          <User size={24} />
        </NavLink>
      </nav>
    </div>
  );
}
