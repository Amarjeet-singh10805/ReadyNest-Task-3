import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {Home,Search,PlusSquare,Heart,Bookmark,LogOut,MessageSquare,Sun,Moon,User,Menu,X,} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { useNotificationStore } from "../store/useNotificationStore";
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchNotifications().catch(() => {});
  }, [fetchNotifications]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
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
          <NavLink to="/messages" className={navItemClass}>
            <MessageSquare size={22} /> Messages
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

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black fixed top-0 left-0 right-0 z-40">
        <h1 className="text-xl font-bold bg-gradient-to-r from-brand-500 to-purple-500 bg-clip-text text-transparent">
          InstaForge
        </h1>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="bg-brand-500 text-white text-xs rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
          <button onClick={() => setMenuOpen(true)}>
            <Menu size={26} />
          </button>
        </div>
      </header>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-72 bg-white dark:bg-black border-l border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-300 flex flex-col ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <img
              src={
                user?.profilePicture ||
                `https://ui-avatars.com/api/?name=${user?.username}`
              }
              className="w-9 h-9 rounded-full object-cover"
            />
            <span className="font-semibold text-sm">{user?.username}</span>
          </div>
          <button onClick={closeMenu}>
            <X size={22} />
          </button>
        </div>

        {/* Drawer Nav */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          <NavLink to="/" end className={navItemClass} onClick={closeMenu}>
            <Home size={22} /> Home
          </NavLink>
          <NavLink to="/search" className={navItemClass} onClick={closeMenu}>
            <Search size={22} /> Search
          </NavLink>
          <NavLink to="/create" className={navItemClass} onClick={closeMenu}>
            <PlusSquare size={22} /> Create Post
          </NavLink>
          <NavLink to="/messages" className={navItemClass}>
            <MessageSquare size={22} /> Messages
          </NavLink>
          <NavLink to="/notifications" className={navItemClass} onClick={closeMenu}>
            <Heart size={22} /> Notifications
            {unreadCount > 0 && (
              <span className="ml-auto bg-brand-500 text-white text-xs rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/saved" className={navItemClass} onClick={closeMenu}>
            <Bookmark size={22} /> Saved
          </NavLink>
          <NavLink to={`/profile/${user?.id}`} className={navItemClass} onClick={closeMenu}>
            <User size={22} /> Profile
          </NavLink>
          <NavLink to="/profile/edit" className={navItemClass} onClick={closeMenu}>
            <User size={22} /> Edit Profile
          </NavLink>
        </nav>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => { toggleTheme(); closeMenu(); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
          >
            {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-red-500"
          >
            <LogOut size={22} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
