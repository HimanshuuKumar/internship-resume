import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  MessageCircle,
  Tag,
  Clock,
  Sparkles,
  BookOpen,
  Share2,
  Bookmark,
  ChevronRight,
  Flame,
  User,
  TrendingUp,
  Menu,
  X,
  Filter,
  ArrowRight,
  Eye,
  Calendar,
  Zap,
  Award,
  Users,
  PenTool,
} from "lucide-react";

// Custom Hooks
const useBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:4000/api/blogs");

      if (response.data.success) {
        setBlogs(response.data.blogs);
      } else {
        throw new Error("Failed to fetch blogs");
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError(error.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { blogs, loading, error, refetch: fetchBlogs };
};

const useFilteredBlogs = (blogs, searchTerm, selectedTag) => {
  return useMemo(() => {
    let filtered = [...blogs];

    if (selectedTag !== "All") {
      filtered = filtered.filter(
        (blog) => blog.tags && blog.tags.includes(selectedTag),
      );
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchLower) ||
          blog.excerpt?.toLowerCase().includes(searchLower) ||
          blog.content?.toLowerCase().includes(searchLower) ||
          blog.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
      );
    }

    return filtered;
  }, [blogs, searchTerm, selectedTag]);
};

const useTags = (blogs) => {
  return useMemo(() => {
    const tagsSet = new Set();
    blogs.forEach((blog) => {
      if (blog.tags && Array.isArray(blog.tags)) {
        blog.tags.forEach((tag) => tagsSet.add(tag));
      }
    });
    return ["All", ...Array.from(tagsSet).sort()];
  }, [blogs]);
};

// Utility Functions
const getRelativeTime = (date) => {
  const now = new Date();
  const published = new Date(date);
  const diffInSeconds = Math.floor((now - published) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 604800)}w ago`;
};

const getReadingTime = (content) => {
  if (!content) return 1;
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

const getRandomNumber = (max) => Math.floor(Math.random() * max);

// Components
const LoadingSkeleton = () => (
  <div className="space-y-4 sm:space-y-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
          <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200"></div>
            <div className="flex-1">
              <div className="mb-1 h-2 w-24 sm:h-3 sm:w-32 rounded bg-gray-200"></div>
              <div className="h-1.5 w-20 sm:h-2 sm:w-24 rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="mb-2 h-5 w-3/4 rounded bg-gray-200 sm:mb-3 sm:h-6"></div>
          <div className="mb-1.5 h-3 w-full rounded bg-gray-200 sm:mb-2 sm:h-4"></div>
          <div className="mb-1.5 h-3 w-5/6 rounded bg-gray-200 sm:mb-2 sm:h-4"></div>
          <div className="mb-3 flex gap-1.5 sm:mb-4">
            <div className="h-5 w-14 rounded-full bg-gray-200 sm:h-6 sm:w-16"></div>
            <div className="h-5 w-16 rounded-full bg-gray-200 sm:h-6 sm:w-20"></div>
          </div>
          <div className="flex gap-3 sm:gap-4">
            <div className="h-3 w-10 rounded bg-gray-200 sm:h-4 sm:w-12"></div>
            <div className="h-3 w-10 rounded bg-gray-200 sm:h-4 sm:w-12"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="py-12 sm:py-16 text-center">
    <div className="mx-auto mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
      <BookOpen size={28} className="text-purple-600" />
    </div>
    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
      No articles found
    </h3>
    <p className="mt-1 text-xs sm:text-sm text-gray-500">
      Try different search or topic
    </p>
  </div>
);

const BlogCard = ({ blog, onTagClick, onLike, onSave, onShare }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    onLike?.(blog._id, !liked);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setSaved(!saved);
    onSave?.(blog._id, !saved);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.origin + `/blog/${blog._id}`,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    }
    onShare?.(blog._id);
  };

  return (
    <article
      onClick={() => navigate(`/blog/${blog._id}`)}
      className="group relative rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 transition-all duration-300 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/30 cursor-pointer"
    >
      {/* Author Section */}
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {blog.author?.profilePic ? (
            <img
              src={blog.author.profilePic}
              alt={blog.author.name}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-purple-100"
            />
          ) : (
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs sm:text-sm font-semibold text-white">
              {blog.author?.name?.charAt(0) || "A"}
            </div>
          )}

          <div>
            <p className="text-xs sm:text-sm font-semibold text-gray-900">
              {blog.author?.name || "Anonymous"}
            </p>
            <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-xs text-gray-500">
              <span className="flex items-center gap-0.5 sm:gap-1">
                <Clock size={10} />
                {getRelativeTime(blog.createdAt)}
              </span>
              <span>•</span>
              <span>{getReadingTime(blog.content)} min read</span>
            </div>
          </div>
        </div>

        <button
          className="rounded-full p-1.5 text-gray-400 transition hover:bg-purple-50 hover:text-purple-600"
          onClick={handleSave}
        >
          <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Title */}
      <h2 className="mb-1.5 sm:mb-2 text-base sm:text-xl font-bold leading-tight text-gray-900 transition group-hover:text-purple-600 line-clamp-2">
        {blog.title}
      </h2>

      {/* Excerpt */}
      <p className="mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed text-gray-600 line-clamp-2">
        {blog.excerpt || blog.content?.substring(0, 120)}...
      </p>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="mb-3 sm:mb-4 flex flex-wrap gap-1 sm:gap-1.5">
          {blog.tags.slice(0, 3).map((tag) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(tag);
              }}
              className="inline-flex items-center gap-0.5 sm:gap-1 rounded-full bg-purple-50 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-medium text-purple-700 transition hover:bg-purple-100"
            >
              <Tag size={9} />
              {tag}
            </button>
          ))}
          {blog.tags.length > 3 && (
            <span className="text-[10px] sm:text-xs text-gray-400">
              +{blog.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Engagement Bar */}
      <div className="flex items-center gap-4 sm:gap-6 pt-2 border-t border-gray-100">
        <button
          className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 transition hover:text-red-500"
          onClick={handleLike}
        >
          <Heart
            size={12}
            className="transition group-hover:scale-110"
            fill={liked ? "currentColor" : "none"}
          />
          <span>{blog.likes || getRandomNumber(200)}</span>
        </button>
        <button
          className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 transition hover:text-purple-600"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/blog/${blog._id}#comments`);
          }}
        >
          <MessageCircle size={12} />
          <span>{blog.comments?.length || getRandomNumber(50)}</span>
        </button>
        <button
          className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 transition hover:text-green-600"
          onClick={handleShare}
        >
          <Share2 size={12} />
        </button>
      </div>
    </article>
  );
};

const HeroSection = ({ searchTerm, onSearchChange }) => (
  <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600">
    {/* Animated Background */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
    </div>

    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 lg:py-20 lg:px-8">
      <div className="text-center">
        <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 sm:px-4 sm:py-1.5">
          <Sparkles size={14} className="text-yellow-300" />
          <span className="text-xs sm:text-sm font-medium text-white">
            BlogSpace
          </span>
        </div>
        <h1 className="mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
          Ideas worth
          <span className="text-yellow-300"> sharing</span>
        </h1>
        <p className="mx-auto max-w-md text-xs sm:text-sm text-purple-100">
          Discover stories, insights, and perspectives from amazing writers
        </p>

        {/* Search Bar */}
        <div className="mx-auto mt-6 sm:mt-8 max-w-md sm:max-w-lg">
          <div className="relative group">
            <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition group-focus-within:text-purple-500" />
            <input
              type="text"
              placeholder="Search articles, topics, or authors..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl sm:rounded-2xl border-0 bg-white py-2.5 sm:py-3 pl-9 sm:pl-11 pr-3 sm:pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-300 shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FilterBar = ({ tags, selectedTag, onTagSelect }) => {
  const [showAllTags, setShowAllTags] = useState(false);
  const visibleTags = showAllTags ? tags : tags.slice(0, 8);

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-purple-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-700">
            Browse Topics
          </span>
        </div>
        {tags.length > 8 && (
          <button
            onClick={() => setShowAllTags(!showAllTags)}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
          >
            {showAllTags ? "Show Less" : "Show All"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {visibleTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className={`whitespace-nowrap rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 ${
              selectedTag === tag
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            }`}
          >
            {tag === "All" ? "✨ All" : `#${tag}`}
          </button>
        ))}
      </div>
    </div>
  );
};

const TrendingSidebar = ({ blogs, onBlogClick }) => (
  <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 transition hover:shadow-md">
    <div className="mb-3 sm:mb-4 flex items-center gap-2">
      <div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-500 p-1.5">
        <Flame size={12} className="text-white" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-gray-900">
        🔥 Trending Now
      </h3>
    </div>
    <div className="space-y-3 sm:space-y-4">
      {blogs.slice(0, 5).map((blog, idx) => (
        <button
          key={blog._id}
          onClick={() => onBlogClick(blog._id)}
          className="group block w-full text-left"
        >
          <div className="flex items-start gap-2">
            <span
              className={`text-xs sm:text-sm font-bold ${
                idx === 0
                  ? "text-orange-500"
                  : idx === 1
                    ? "text-purple-500"
                    : "text-gray-400"
              }`}
            >
              #{idx + 1}
            </span>
            <p className="flex-1 text-xs sm:text-sm text-gray-700 transition group-hover:text-purple-600 line-clamp-2">
              {blog.title}
            </p>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const TopicsSidebar = ({ tags, selectedTag, onTagSelect }) => (
  <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 transition hover:shadow-md">
    <div className="mb-3 sm:mb-4 flex items-center gap-2">
      <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-1.5">
        <Tag size={12} className="text-white" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-gray-900">
        📚 Popular Topics
      </h3>
    </div>
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {tags.slice(1, 9).map((tag) => (
        <button
          key={tag}
          onClick={() => onTagSelect(tag)}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
            selectedTag === tag
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  </div>
);

const WriteCTA = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-5 sm:p-6 text-center">
      <div className="absolute inset-0 bg-white/5"></div>
      <div className="relative">
        <div className="inline-flex p-2 bg-white/20 rounded-full mb-3">
          <PenTool size={16} className="text-white" />
        </div>
        <h4 className="mb-1 text-sm sm:text-base font-bold text-white">
          Share Your Story
        </h4>
        <p className="mb-3 text-xs text-purple-100">Join 1,000+ writers</p>
        <button
          onClick={() => navigate("/create-blog")}
          className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-purple-600 transition hover:scale-105 hover:shadow-md"
        >
          Start Writing
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

const StatsSidebar = ({ blogs, tags }) => {
  const uniqueAuthors = new Set(blogs.map((b) => b.author?._id)).size;

  return (
    <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">Community Stats</span>
        <span className="text-xs font-semibold text-purple-600">✨ Active</span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <BookOpen size={16} className="text-purple-500" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-900">
            {blogs.length}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500">Articles</p>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <Tag size={16} className="text-pink-500" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-900">
            {tags.length - 1}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500">Topics</p>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <Users size={16} className="text-green-500" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-900">
            {uniqueAuthors}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500">Writers</p>
        </div>
      </div>
    </div>
  );
};

const MobileFilterDrawer = ({
  tags,
  selectedTag,
  onTagSelect,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Filter by Topic</h3>
          <button onClick={onClose} className="p-1 rounded-full bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  onTagSelect(tag);
                  onClose();
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedTag === tag
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {tag === "All" ? "✨ All" : `#${tag}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const HomePage = () => {
  const { blogs, loading, error } = useBlogs();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const filteredBlogs = useFilteredBlogs(blogs, searchTerm, selectedTag);
  const allTags = useTags(blogs);

  const handleTagSelect = useCallback((tag) => {
    setSelectedTag(tag);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBlogClick = useCallback((blogId) => {
    console.log("Blog clicked:", blogId);
  }, []);

  const handleLike = useCallback(async (blogId, isLiked) => {
    console.log("Like toggled:", blogId, isLiked);
  }, []);

  const handleSave = useCallback(async (blogId, isSaved) => {
    console.log("Save toggled:", blogId, isSaved);
  }, []);

  const handleShare = useCallback((blogId) => {
    console.log("Share clicked:", blogId);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <p className="text-red-600 mb-4 text-sm sm:text-base">
            Error: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <HeroSection searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 lg:py-12 lg:px-8">
        <div className="lg:flex lg:gap-8 lg:gap-10">
          {/* Main Feed */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700"
              >
                <Filter size={16} />
                Filter by Topic
                {selectedTag !== "All" && (
                  <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs">
                    {selectedTag}
                  </span>
                )}
              </button>
            </div>

            <FilterBar
              tags={allTags}
              selectedTag={selectedTag}
              onTagSelect={handleTagSelect}
            />

            {loading ? (
              <LoadingSkeleton />
            ) : filteredBlogs.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {filteredBlogs.map((blog) => (
                  <BlogCard
                    key={blog._id}
                    blog={blog}
                    onTagClick={handleTagSelect}
                    onLike={handleLike}
                    onSave={handleSave}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block lg:w-80">
            <div className="sticky top-8 space-y-6">
              <TrendingSidebar blogs={blogs} onBlogClick={handleBlogClick} />
              <TopicsSidebar
                tags={allTags}
                selectedTag={selectedTag}
                onTagSelect={handleTagSelect}
              />
              <WriteCTA />
              <StatsSidebar blogs={blogs} tags={allTags} />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        tags={allTags}
        selectedTag={selectedTag}
        onTagSelect={handleTagSelect}
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
      />

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
