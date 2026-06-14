import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Clock,
  Eye,
  User,
  Tag,
  Calendar,
  Mail,
  Bell,
  Share2,
  ChevronUp,
} from "lucide-react";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showProgress, setShowProgress] = useState(0);
  const [showFAB, setShowFAB] = useState(false);
  const token = localStorage.getItem("token");

  // Reading progress and FAB visibility
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setShowProgress(progress);
      setShowFAB(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch blog details using id
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `http://localhost:4000/api/blogs/${id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );

        if (response.data.success) {
          setBlog(response.data.blog);
        } else {
          throw new Error("Blog not found");
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError(err.response?.data?.message || "Failed to load blog post");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id, token]);

  const handleLike = () => {
    setLiked(!liked);
    setBlog((prev) => ({
      ...prev,
      likes: liked ? (prev.likes || 0) - 1 : (prev.likes || 0) + 1,
    }));
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const handleSubscribe = () => {
    setSubscribed(!subscribed);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title,
          text: `Check out this article: ${blog?.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const formatDate = (date) => {
    if (!date) return "Recent";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getReadingTime = (content) => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length || 0;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="px-4 py-6 sm:py-12 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-7 w-28 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-10 w-full bg-gray-200 rounded-2xl mb-4"></div>
          <div className="h-10 w-5/6 bg-gray-200 rounded-2xl mb-8"></div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="flex-1">
              <div className="h-3 w-28 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 w-40 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-3 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSkeleton />;

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">
            Blog not found
          </h2>
          <p className="text-gray-600 mb-6 max-w-xs mx-auto">
            {error ||
              "The article you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition shadow-lg"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-0.5 bg-purple-100 z-50">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-100"
          style={{ width: `${showProgress}%` }}
        ></div>
      </div>

      {/* Navigation Bar - Mobile Optimized */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 transition"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${
                liked
                  ? "bg-red-50 text-red-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
              <span className="text-sm font-medium">
                {blog.likes?.length || blog.likes || 0}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              <Share2 size={16} />
              <span className="text-sm font-medium hidden sm:inline">
                Share
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <div className="border-b border-gray-100 bg-white">
        <div className="px-4 py-6 sm:py-8 md:py-12 max-w-4xl mx-auto">
          {/* Category/Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {blog.category && (
              <Link
                to={`/category/${blog.category}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full"
              >
                <Tag size={11} />
                {blog.category}
              </Link>
            )}
            {blog.tags?.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                to={`/tag/${tag}`}
                className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
              >
                #{tag}
              </Link>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
            {blog.title}
          </h1>

          {/* Author Info - Mobile Optimized */}
          <div className="flex flex-col gap-4 py-4 border-t border-b border-gray-100">
            <div className="flex items-center gap-3">
              {blog.author?.profilePic ? (
                <img
                  src={blog.author.profilePic}
                  alt={blog.author.name}
                  className="h-10 w-10 rounded-full object-cover ring-3 ring-purple-50"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold text-base">
                  {blog.author?.name?.charAt(0) || "A"}
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">
                  {blog.author?.name || "Anonymous Author"}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDate(blog.publishedAt || blog.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {getReadingTime(blog.content)} min read
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={11} />
                    {blog.views || 0} views
                  </span>
                </div>
              </div>
            </div>

            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium hover:bg-purple-700 transition shadow-md w-full sm:w-auto">
              <User size={14} />
              Follow Author
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnail - Mobile Optimized */}
      {blog.thumbnail && (
        <div className="w-full bg-gradient-to-b from-white to-gray-100">
          <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto -mt-6">
            <div className="relative overflow-hidden rounded-xl shadow-xl bg-gray-100">
              <div className="relative w-full pt-[56.25%]">
                <img
                  src={blog.thumbnail}
                  alt={blog.title}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/1200x600?text=No+Image";
                    e.target.onerror = null;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Mobile Optimized */}
      <div className="px-4 py-8 sm:py-12 max-w-3xl mx-auto">
        {/* Article Content */}
        <article className="prose prose-sm max-w-none">
          <div
            className="
              font-serif
              text-gray-800
              leading-relaxed
              space-y-4
              [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-gray-900 [&>h1]:mt-8 [&>h1]:mb-4
              [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-6 [&>h2]:mb-3
              [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mt-5 [&>h3]:mb-2
              [&>h4]:text-base [&>h4]:font-semibold [&>h4]:text-gray-900 [&>h4]:mt-4 [&>h4]:mb-2
              [&>p]:text-gray-700 [&>p]:leading-relaxed [&>p]:mb-4 [&>p]:text-sm
              [&>a]:text-purple-600 [&>a]:underline
              [&>strong]:text-gray-900 [&>strong]:font-semibold
              [&>em]:italic [&>em]:text-gray-600
              [&>code]:font-mono [&>code]:text-xs [&>code]:bg-gray-100 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded
              [&>pre]:bg-gray-900 [&>pre]:rounded-xl [&>pre]:p-4 [&>pre]:overflow-x-auto [&>pre]:my-6
              [&>pre>code]:bg-transparent [&>pre>code]:text-gray-100 [&>pre>code]:p-0 [&>pre>code]:text-xs
              [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul]:my-4
              [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1.5 [&>ol]:my-4
              [&>li]:text-gray-700 [&>li]:leading-relaxed [&>li]:text-sm
              [&>blockquote]:border-l-4 [&>blockquote]:border-purple-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>blockquote]:my-6 [&>blockquote]:text-sm
              [&>img]:rounded-xl [&>img]:shadow-lg [&>img]:my-6 [&>img]:w-full
              [&>figure]:my-6 [&>figcaption]:text-center [&>figcaption]:text-xs [&>figcaption]:text-gray-500 [&>figcaption]:mt-2
              [&>hr]:my-8 [&>hr]:border-gray-200
              [&>table]:w-full [&>table]:border-collapse [&>table]:my-6 [&>table]:text-xs
              [&>th]:border [&>th]:border-gray-300 [&>th]:p-2 [&>th]:bg-gray-100 [&>th]:font-semibold
              [&>td]:border [&>td]:border-gray-300 [&>td]:p-2
            "
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        {/* Engagement Section - Mobile Optimized */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3 py-6 border-t border-b border-gray-200">
          <button
            onClick={handleLike}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full transition-all duration-200 w-full sm:w-auto ${
              liked
                ? "bg-red-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
            <span className="font-medium">
              {blog.likes?.length || blog.likes || 0} Likes
            </span>
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full transition-all duration-200 w-full sm:w-auto ${
              saved
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition w-full sm:w-auto"
          >
            <ChevronUp size={18} />
            <span>Top</span>
          </button>
        </div>

        {/* Subscribe Section - Mobile Optimized */}
        <div className="mt-12">
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-6 text-center shadow-md">
            <div className="inline-flex p-2 bg-white rounded-full shadow-md mb-4">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
              Never miss a story
            </h3>
            <p className="text-sm text-gray-600 mb-5 max-w-xs mx-auto">
              Get stories from{" "}
              <span className="font-semibold text-purple-600">
                {blog.author?.name || "this writer"}
              </span>{" "}
              in your inbox
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm"
              />
              <button
                onClick={handleSubscribe}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                  subscribed
                    ? "bg-green-600 text-white"
                    : "bg-purple-600 text-white hover:bg-purple-700 shadow-md"
                }`}
              >
                <Mail size={15} />
                {subscribed ? "Subscribed! ✓" : "Subscribe"}
              </button>
            </div>
          </div>
        </div>

        {/* Author Bio - Mobile Optimized */}
        {blog.author && (
          <div className="mt-12 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-4">
              {blog.author.profilePic ? (
                <img
                  src={blog.author.profilePic}
                  alt={blog.author.name}
                  className="h-16 w-16 rounded-full object-cover ring-3 ring-purple-100"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl font-semibold">
                  {blog.author.name?.charAt(0) || "A"}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">
                  {blog.author.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {blog.author.bio ||
                    "Passionate writer sharing insights and stories about technology, life, and everything in between."}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleSubscribe}
                    className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                  >
                    <Mail size={13} />
                    Subscribe
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                    <User size={13} />
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button - Mobile Only */}
      <div
        className={`fixed bottom-5 right-5 z-40 transition-all duration-300 ${
          showFAB
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-2">
          <button
            onClick={handleLike}
            className={`p-3 rounded-full shadow-xl transition-all duration-200 ${
              liked
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 shadow-lg"
            }`}
          >
            <Heart size={20} fill={liked ? "currentColor" : "none"} />
          </button>

          <button
            onClick={handleSave}
            className={`p-3 rounded-full shadow-xl transition-all duration-200 ${
              saved
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 shadow-lg"
            }`}
          >
            <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
          </button>

          <button
            onClick={handleShare}
            className="p-3 rounded-full shadow-xl bg-white text-gray-700 shadow-lg"
          >
            <Share2 size={20} />
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="p-3 rounded-full shadow-xl bg-purple-600 text-white shadow-lg"
          >
            <ChevronUp size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
