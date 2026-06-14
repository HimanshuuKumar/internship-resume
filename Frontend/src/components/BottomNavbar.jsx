import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, Plus, User, LogIn } from "lucide-react";

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState("home");
  const token = localStorage.getItem("token");

  // Update active state based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setActive("home");
    else if (path === "/search") setActive("search");
    else if (path === "/profile") setActive("profile");
    else if (path === "/create") setActive("create");
    else if (path === "/login") setActive("login");
  }, [location]);

  const handleNavigation = (id, path) => {
    setActive(id);
    navigate(path);
  };

  const navItems = [
    { id: "home", icon: <Home size={22} />, label: "Home", path: "/" },
    {
      id: "search",
      icon: <Search size={22} />,
      label: "Search",
      path: "/search",
    },
    {
      id: "create",
      icon: <Plus size={24} />,
      label: "Write",
      path: "/create",
      isSpecial: true,
    },
  ];

  // Add profile or login based on auth status
  if (token) {
    navItems.push({
      id: "profile",
      icon: <User size={22} />,
      label: "Profile",
      path: "/profile",
    });
  } else {
    navItems.push({
      id: "login",
      icon: <LogIn size={22} />,
      label: "Login",
      path: "/login",
    });
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50">
        <div className="bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-lg">
          <div className="flex justify-around items-center px-4 py-2">
            {navItems.map((item) => {
              const isActive = active === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id, item.path)}
                  className={`flex flex-col items-center justify-center transition-all duration-200 ${
                    item.isSpecial ? "relative -top-3" : ""
                  }`}
                >
                  {item.isSpecial ? (
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-3 shadow-lg shadow-purple-200">
                      {item.icon}
                    </div>
                  ) : (
                    <div
                      className={`p-1 ${isActive ? "text-purple-600" : "text-gray-500"}`}
                    >
                      {item.icon}
                    </div>
                  )}
                  <span
                    className={`text-[10px] mt-1 ${
                      isActive && !item.isSpecial
                        ? "text-purple-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add padding to body for mobile */}
      <style jsx global>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: 65px;
          }
        }
      `}</style>
    </>
  );
};

export default BottomNavbar;
