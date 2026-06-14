import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import BottomNavbar from "./components/BottomNavbar";
import Profile from "./pages/Profile";
import CreateBlog from "./pages/CreateBlog";
// Pages (create these later)
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UpdateProfile from "./pages/updateProfile";
import HomePage from "./pages/HomePage";
import BlogDetails from "./pages/BlogDetails";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen w-full flex bg-[#fff]">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 md:ml-20">
          <main className="w-full max-w-5xl mx-auto px-2 py-4 sm:px-4 sm:py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/create" element={<CreateBlog />} />
              <Route path="/profile/edit" element={<UpdateProfile />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/blog/:id" element={<BlogDetails />} />
            </Routes>
          </main>
        </div>

        {/* Mobile Bottom Navbar */}
        <BottomNavbar />
      </div>
    </Router>
  );
};

export default App;
