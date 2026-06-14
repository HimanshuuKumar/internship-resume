import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Save, Upload, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    email: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // GET USER (prefill form)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.user;
        setForm({
          name: user.name,
          username: user.username,
          bio: user.bio,
          email: user.email,
        });
        setPreview(user.profilePic);
      } catch (err) {
        console.log("Fetch error:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePic(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("name", form.name);
      data.append("username", form.username);
      data.append("bio", form.bio);
      if (profilePic) data.append("profilePic", profilePic);

      await axios.put("http://localhost:4000/api/users/me", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/profile");
    } catch (err) {
      console.log("Update error:", err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mb-3 text-purple-600">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
          </div>
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl  bg-[#fafafa]">
      {/* Mobile First Container */}
      <div className="mx-auto w-full px-0.5 py-2 sm:max-w-2xl sm:px-6 sm:py-6 md:max-w-3xl md:py-8 lg:max-w-4xl">
        {/* HEADER */}
        <div className="mb-4 flex items-center gap-3 sm:mb-6">
          <button
            onClick={() => navigate("/profile")}
            className="rounded-xl border border-gray-200 bg-white p-2 transition hover:bg-gray-50 active:scale-95 sm:p-2.5"
            aria-label="Go back"
          >
            <ArrowLeft size={18} className="sm:size-[20px]" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Update Profile
          </h1>
        </div>

        {/* MAIN CARD */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6 md:p-8">
          {/* PROFILE IMAGE SECTION - IMPROVED */}
          <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative">
              <img
                src={preview || "https://via.placeholder.com/100"}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover ring-4 ring-gray-100 transition hover:ring-purple-100 sm:h-24 sm:w-24"
              />
              <label
                htmlFor="profile-upload"
                className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-purple-600 p-1.5 text-white shadow-lg transition hover:bg-purple-700 active:scale-95 sm:p-2"
              >
                <Upload size={12} className="sm:size-3.5" />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <label
                htmlFor="profile-upload"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-95 sm:px-5 sm:py-2.5"
              >
                <Upload size={14} className="sm:size-4" />
                Choose Photo
              </label>
              <p className="mt-2 text-xs text-gray-400 sm:text-sm">
                JPG, PNG or GIF. Max 5MB
              </p>
            </div>

            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* FORM FIELDS */}
          <div className="grid gap-4 sm:gap-5">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 sm:text-base">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base"
              />
            </div>

            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-700 sm:text-base">
                Username
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 sm:left-4">
                  @
                </span>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="username"
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-7 pr-3 text-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 sm:rounded-2xl sm:py-3 sm:pl-8 sm:pr-4 sm:text-base"
                />
              </div>
            </div>

            {/* Email - Disabled */}
            <div>
              <label className="text-sm font-medium text-gray-700 sm:text-base">
                Email Address
              </label>
              <input
                value={form.email}
                disabled
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base"
              />
              <p className="mt-1 text-xs text-gray-400 sm:mt-1.5 sm:text-sm">
                Email cannot be changed
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm font-medium text-gray-700 sm:text-base">
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about yourself..."
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base"
              />
              <p className="mt-1 text-right text-xs text-gray-400 sm:mt-1.5 sm:text-sm">
                {form.bio?.length || 0}/200 characters
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <button
              onClick={() => navigate("/profile")}
              className="order-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-95 sm:order-1 sm:flex-1 sm:rounded-2xl sm:py-3 sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="order-1 flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed sm:order-2 sm:flex-1 sm:rounded-2xl sm:py-3 sm:text-base"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="sm:size-[18px]" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* TIPS CARD - Optional */}
        <div className="mt-4 rounded-xl bg-purple-50 p-4 sm:mt-6 sm:rounded-2xl sm:p-5">
          <div className="flex items-start gap-3">
            <User size={18} className="mt-0.5 text-purple-600 sm:size-[20px]" />
            <div>
              <h3 className="text-sm font-semibold text-purple-900 sm:text-base">
                Profile Tips
              </h3>
              <p className="mt-1 text-xs text-purple-700 sm:text-sm">
                • Add a clear profile picture to build trust
                <br />
                • Use a username that's easy to remember
                <br />• Write a bio that showcases your personality
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
