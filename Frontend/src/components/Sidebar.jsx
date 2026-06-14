import React from "react";
import { Home, Compass, BookOpen, User, Plus, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const token = localStorage.getItem("token");
  return (
    <aside
      className="
    hidden md:flex
    fixed left-0 top-0
    h-screen
    w-20 hover:w-64
    group
    bg-gradient-to-b from-white to-[#f7f6ff]
    border-r border-gray-100
    flex-col justify-between
    px-3 py-6
    z-50
    transition-all duration-100 ease
    overflow-hidden
  "
    >
      {/* TOP SECTION */}
      <div>
        {/* LOGO */}
        <div className="mb-10 flex items-center px-2 min-h-[40px]">
          <Link to="/" className="flex items-center gap-3">
            {/* UNIQUE BRAND LOGO */}
            <div
              className="
        relative
        w-11 h-11
        rounded-2xl
        bg-gradient-to-br
        from-violet-600
        via-indigo-500
        to-cyan-400
        flex items-center justify-center
        shadow-lg
        overflow-hidden
      "
            >
              {/* GLOW */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

              {/* CUSTOM SYMBOL */}
              <div className="relative flex items-center justify-center">
                <div
                  className="
            w-6 h-6
            border-[3px]
            border-white
            rounded-full
            flex items-center justify-center
            rotate-12
          "
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>

                {/* FLOATING DOT */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-200 rounded-full"></div>
              </div>
            </div>

            {/* BRAND NAME */}
            <h1
              className="
        text-2xl font-extrabold
        tracking-tight
        bg-gradient-to-r
        from-violet-600
        via-indigo-500
        to-cyan-500
        bg-clip-text
        text-transparent
        whitespace-nowrap
        opacity-0
        translate-x-[-10px]
        group-hover:opacity-100
        group-hover:translate-x-0
        transition-all duration-300
      "
            >
              InkFlow
            </h1>
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-2">
          <Link
            to="/"
            className="
    flex items-center
    gap-4
    px-4 py-3
    rounded-xl
    hover:bg-gray-100
    transition-all
    whitespace-nowrap
  "
          >
            <Home size={20} className="min-w-[20px]" />

            <span
              className="
      opacity-0
      translate-x-[-10px]
      group-hover:opacity-100
      group-hover:translate-x-0
      transition-all duration-200
    "
            >
              Home
            </span>
          </Link>

          <Link
            to="/bookmarks"
            className="
    flex items-center
    gap-4
    px-4 py-3
    rounded-xl
    hover:bg-gray-100
    transition-all
    whitespace-nowrap
  "
          >
            <BookOpen size={20} className="min-w-[20px]" />

            <span
              className="
      opacity-0
      translate-x-[-10px]
      group-hover:opacity-100
      group-hover:translate-x-0
      transition-all duration-200
    "
            >
              Bookmarks
            </span>
          </Link>

          <Link
            to="/profile"
            className="
    flex items-center
    gap-4
    px-4 py-3
    rounded-xl
    hover:bg-gray-100
    transition-all
    whitespace-nowrap
  "
          >
            <User size={20} className="min-w-[20px]" />

            <span
              className="
      opacity-0
      translate-x-[-10px]
      group-hover:opacity-100
      group-hover:translate-x-0
      transition-all duration-200
    "
            >
              Profile
            </span>
          </Link>

          {/* CREATE BLOG */}
          <Link
            to="/create"
            className="
    flex items-center
    gap-4
    px-4 py-3
    rounded-xl
    hover:bg-gray-100
    transition-all
    whitespace-nowrap
  "
          >
            <Plus size={20} className="min-w-[20px]" />

            <span
              className="
      opacity-0
      translate-x-[-10px]
      group-hover:opacity-100
      group-hover:translate-x-0
      transition-all duration-200
    "
            >
              Create Blog
            </span>
          </Link>

          {/* LOGIN / LOGOUT BUTTON */}
          {!token ? (
            <Link
              to="/login"
              className="
    flex items-center
    gap-4
    px-4 py-3
    rounded-xl
    hover:bg-gray-100
    transition-all
    whitespace-nowrap
  "
            >
              <LogIn size={20} className="min-w-[20px]" />

              <span
                className="
      opacity-0
      translate-x-[-10px]
      group-hover:opacity-100
      group-hover:translate-x-0
      transition-all duration-200
    "
              >
                Login
              </span>
            </Link>
          ) : (
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
              className="
    flex items-center
    gap-4
    px-4 py-3
    rounded-xl
    hover:bg-red-50
    text-red-600
    transition-all
    whitespace-nowrap
    w-full
  "
            >
              <LogIn size={20} className="min-w-[20px]" />

              <span
                className="
      opacity-0
      translate-x-[-10px]
      group-hover:opacity-100
      group-hover:translate-x-0
      transition-all duration-200
    "
              >
                Logout
              </span>
            </button>
          )}
        </nav>

        {/* DIVIDER */}
        <div className="my-6 border-t border-gray-100"></div>
      </div>
      {/* BOTTOM USER SECTION */}
    </aside>
  );
};

const SidebarItem = ({ icon, label, active }) => {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
        active
          ? "bg-purple-50 text-purple-600 font-medium"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
};

export default Sidebar;
