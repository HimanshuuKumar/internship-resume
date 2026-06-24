import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
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
  TrendingUp,
  Filter,
  X,
  PenTool,
} from "lucide-react";

// ============================================
// 1. CACHE LAYER (Prevents repeated API calls)
// ============================================
const CACHE_KEY = "blogs_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedBlogs = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const setCachedBlogs = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch {}
};

// ============================================
// 2. OPTIMIZED API HOOK (with caching + abort)
// ============================================
const useBlogs = () => {
  const [blogs, setBlogs] = useState(() => getCachedBlogs() || []);
  const [loading, setLoading] = useState(!getCachedBlogs());
  const [error, setError] = useState(null);

  const fetchBlogs = useCallback(async (signal) => {
    // Check cache first
    const cached = getCachedBlogs();
    if (cached) {
      setBlogs(cached);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // ✅ Add limit to reduce payload
      const response = await axios.get(
        "https://internship-resume.onrender.com/api/blogs?limit=50",
        { signal }
      );

      if (response.data.success) {
        const blogData = response.data.blogs;
        setBlogs(blogData);
        setCachedBlogs(blogData);
      } else {
        throw new Error("Failed to fetch blogs");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching blogs:", error);
        setError(error.message || "Failed to load blogs");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    fetchBlogs(abortController.signal);
    return () => abortController.abort();
  }, [fetchBlogs]);

  return { blogs, loading, error, refetch: () => fetchBlogs() };
};

// ============================================
// 3. MEMOIZED SELECTORS (Prevents recalculation)
// ============================================
const useFilteredBlogs = (blogs, searchTerm, selectedTag) => {
  return useMemo(() => {
    let filtered = blogs;
    
    // Early return if no filters
    if (selectedTag === "All" && !searchTerm.trim()) {
      return filtered;
    }

    filtered = [...blogs];

    if (selectedTag !== "All") {
      filtered = filtered.filter(
        (blog) => blog.tags && blog.tags.includes(selectedTag)
      );
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchLower) ||
          blog.excerpt?.toLowerCase().includes(searchLower) ||
          blog.content?.toLowerCase().includes(searchLower) ||
          blog.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [blogs, searchTerm, selectedTag]);
};

const useTags = (blogs) => {
  return useMemo(() => {
    const tagsSet = new Set();
    for (const blog of blogs) {
      if (blog.tags?.length) {
        for (const tag of blog.tags) {
          tagsSet.add(tag);
        }
      }
    }
    return ["All", ...Array.from(tagsSet).sort()];
  }, [blogs]);
};

// ============================================
// 4. LAZY LOAD COMPONENTS (Code splitting)
// ============================================
const BlogCard = lazy(() => import("./components/BlogCard"));
const HeroSection = lazy(() => import("./components/HeroSection"));
const FilterBar = lazy(() => import("./components/FilterBar"));
const TrendingSidebar = lazy(() => import("./components/TrendingSidebar"));
const TopicsSidebar = lazy(() => import("./components/TopicsSidebar"));
const WriteCTA = lazy(() => import("./components/WriteCTA"));
const StatsSidebar = lazy(() => import("./components/StatsSidebar"));

// ============================================
// 5. LOADING SKELETON (Optimized)
// ============================================
const LoadingSkeleton = React.memo(() => (
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
));

// ============================================
// 6. MAIN COMPONENT (Optimized)
// ============================================
const HomePage = () => {
  const { blogs, loading, error } = useBlogs();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Memoized filtered results
  const filteredBlogs = useFilteredBlogs(blogs, searchTerm, selectedTag);
  const allTags = useTags(blogs);

  // ✅ Pagination (Virtual scrolling would be even better)
  const paginatedBlogs = useMemo(() => {
    const start = 0;
    const end = page * ITEMS_PER_PAGE;
    return filteredBlogs.slice(start, end);
  }, [filteredBlogs, page]);

  const hasMore = paginatedBlogs.length < filteredBlogs.length;

  // Load more handler
  const handleLoadMore = useCallback(() => {
    setPage(p => p + 1);
  }, []);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedTag]);

  // Handlers
  const handleTagSelect = useCallback((tag) => {
    setSelectedTag(tag);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleLike = useCallback(async (blogId, isLiked) => {
    // Optimistic update
    setBlogs(prev => prev.map(b => 
      b._id === blogId ? { ...b, likes: (b.likes || 0) + (isLiked ? 1 : -1) } : b
    ));
    // API call in background
    try {
      await axios.post(`https://internship-resume.onrender.com/api/blogs/${blogId}/like`, {
        liked: isLiked
      });
    } catch (error) {
      console.error("Like failed:", error);
      // Revert on error
      setBlogs(prev => prev.map(b => 
        b._id === blogId ? { ...b, likes: (b.likes || 0) + (isLiked ? -1 : 1) } : b
      ));
    }
  }, []);

  // Error state
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
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm sm:text-base hover:bg-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Suspense fallback={<div className="h-64 bg-purple-600/10 animate-pulse" />}>
        <HeroSection searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      </Suspense>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 lg:py-12 lg:px-8">
        <div className="lg:flex lg:gap-8 lg:gap-10">
          {/* Main Feed */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-purple-300 transition"
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

            <Suspense fallback={<LoadingSkeleton />}>
              <FilterBar
                tags={allTags}
                selectedTag={selectedTag}
                onTagSelect={handleTagSelect}
              />
            </Suspense>

            {loading && paginatedBlogs.length === 0 ? (
              <LoadingSkeleton />
            ) : paginatedBlogs.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="space-y-4 sm:space-y-6">
                  {paginatedBlogs.map((blog) => (
                    <Suspense key={blog._id} fallback={<LoadingSkeleton />}>
                      <BlogCard
                        blog={blog}
                        onTagClick={handleTagSelect}
                        onLike={handleLike}
                      />
                    </Suspense>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="mt-6 sm:mt-8 text-center">
                    <button
                      onClick={handleLoadMore}
                      className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition shadow-lg shadow-purple-200"
                    >
                      Load More Articles
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block lg:w-80">
            <div className="sticky top-8 space-y-6">
              <Suspense fallback={<div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />}>
                <TrendingSidebar blogs={blogs} onBlogClick={handleTagSelect} />
                <TopicsSidebar
                  tags={allTags}
                  selectedTag={selectedTag}
                  onTagSelect={handleTagSelect}
                />
                <WriteCTA />
                <StatsSidebar blogs={blogs} tags={allTags} />
              </Suspense>
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

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// ============================================
// 7. EMPTY STATE (Memoized)
// ============================================
const EmptyState = React.memo(() => (
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
));

// ============================================
// 8. MOBILE FILTER DRAWER
// ============================================
const MobileFilterDrawer = React.memo(({
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
          <button onClick={onClose} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition">
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
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
});

export default HomePage;
