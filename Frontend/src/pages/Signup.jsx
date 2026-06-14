import React, { useState } from "react";
import axios from "axios";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "student",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE SIGNUP
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    setError("");

    try {
      const res = await axios.post(
        "http://localhost:4000/api/users/signup",
        form,
      );

      console.log(res.data);
      localStorage.setItem("token", res.data.token);

      // SAVE USER
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // REDIRECT TO HOME
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center px-1 py-4 pb-5 sm:px-4 sm:py-8 ">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8">
        {/* HEADING */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>

          <p className="text-sm text-gray-500 mt-2">
            Join and start sharing your knowledge
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NAME */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Full Name
            </label>

            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 focus-within:border-purple-500 transition">
              <User size={18} className="text-gray-400" />

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full outline-none text-sm bg-transparent"
                required
              />
            </div>
          </div>

          {/* USERNAME */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Username
            </label>

            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 focus-within:border-purple-500 transition">
              <User size={18} className="text-gray-400" />

              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className="w-full outline-none text-sm bg-transparent"
                required
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Email
            </label>

            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 focus-within:border-purple-500 transition">
              <Mail size={18} className="text-gray-400" />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full outline-none text-sm bg-transparent"
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Password
            </label>

            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 focus-within:border-purple-500 transition">
              <Lock size={18} className="text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full outline-none text-sm bg-transparent"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye size={18} className="text-gray-400" />
                ) : (
                  <EyeOff size={18} className="text-gray-400" />
                )}
              </button>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Account Type
              </label>

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500"
              >
                <option value="student">Student</option>

                <option value="creator">Creator</option>
              </select>
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition disabled:opacity-70 cursor-pointer"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* LOGIN LINK */}
        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
