// In Sidebar.js, add this to the bottom of the navigation section
{token && (
  <button
    onClick={() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("logout"));
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
      mt-4
    "
  >
    <LogOut size={20} className="min-w-[20px]" />
    <span className="opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
      Logout
    </span>
  </button>
)}
