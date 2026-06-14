import React, { useEffect, useMemo, useState, useCallback } from "react";
import RichTextEditor from "../components/RichTextEditor";

import axios from "axios";
import {
  Image,
  Hash,
  BookOpen,
  Eye,
  Save,
  Send,
  X,
  Sparkles,
  Clock3,
  FileText,
  Upload,
} from "lucide-react";

const CHARACTER_LIMITS = {
  TITLE: 150,
  EXCERPT: 300,
};

const CATEGORIES = [
  "Technology",
  "Lifestyle",
  "Travel",
  "Food",
  "Fashion",
  "Business",
  "Health",
  "Education",
  "Entertainment",
  "Sports",
];

const CreateBlog = () => {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [],
    isFeatured: false,
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  // =========================
  // CONTENT STATS
  // =========================
  const wordsCount = useMemo(() => {
    if (!formData.content) return 0;
    const plainText = formData.content.replace(/<[^>]*>/g, "");
    return plainText.trim().split(/\s+/).filter(Boolean).length;
  }, [formData.content]);

  const readingTime = useMemo(() => {
    if (!wordsCount) return 0;
    return Math.ceil(wordsCount / 200);
  }, [wordsCount]);

  // =========================
  // HANDLERS - FIXED with useCallback
  // =========================

  // FIX: Use useCallback to prevent unnecessary re-renders
  const handleChange = useCallback((e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []); // Empty dependency array as setFormData is stable

  const handleAddTag = useCallback(
    (e) => {
      if (e.key === "Enter" && tagInput.trim()) {
        e.preventDefault();
        const cleanTag = tagInput.trim().toLowerCase();

        if (!formData.tags.includes(cleanTag)) {
          setFormData((prev) => ({
            ...prev,
            tags: [...prev.tags, cleanTag],
          }));
        }
        setTagInput("");
      }
    },
    [tagInput, formData.tags],
  );

  const removeTag = useCallback((tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  }, []);

  // =========================
  // SUBMIT BLOG
  // =========================

  const handleSubmit = useCallback(
    async (statusType) => {
      try {
        // validation
        if (!formData.title.trim()) {
          return alert("Title is required");
        }

        const plainText = formData.content.replace(/<[^>]*>/g, "").trim();
        if (!plainText) {
          return alert("Content is required");
        }

        if (!formData.category) {
          return alert("Category is required");
        }

        setLoading(true);

        const form = new FormData();
        form.append("title", formData.title);
        form.append("excerpt", formData.excerpt);
        form.append("content", formData.content);
        form.append("category", formData.category);
        form.append("tags", formData.tags.join(","));
        form.append("status", statusType);
        form.append("isFeatured", String(formData.isFeatured));

        if (thumbnailFile) {
          form.append("thumbnail", thumbnailFile);
        }

        const res = await axios.post(
          "http://localhost:4000/api/blogs/create",
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );

        alert(
          statusType === "published"
            ? "Blog published successfully!"
            : "Draft saved successfully!",
        );

        console.log(res.data);

        // reset form
        setFormData({
          title: "",
          excerpt: "",
          content: "",
          category: "",
          tags: [],
          isFeatured: false,
        });
        setThumbnailFile(null);
        setTagInput("");
        setThumbnailPreview("");
      } catch (error) {
        console.error(error);
        alert(error?.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [formData, thumbnailFile, token],
  );

  // =========================
  // COMPONENTS
  // =========================

  const FormField = useCallback(
    ({ label, required, children }) => (
      <div className="mb-7">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        {children}
      </div>
    ),
    [],
  );

  const CharacterCounter = useCallback(
    ({ current, max }) => (
      <p className="mt-2 text-xs text-gray-400">
        {current}/{max} characters
      </p>
    ),
    [],
  );

  // =========================
  // MAIN UI
  // =========================

  return (
    <div className="min-h-screen bg-[#fafafa] px-0.5 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1 text-sm font-medium text-purple-700">
              <Sparkles size={16} />
              Create Blog
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Share your knowledge with the world
            </h1>

            <p className="mt-2 max-w-2xl text-gray-500">
              Write engaging articles, share your experiences, and build your
              audience.
            </p>
          </div>

          {/* STATS */}
          <div className="flex gap-3">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText size={16} />
                Words
              </div>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {wordsCount}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock3 size={16} />
                Read Time
              </div>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {readingTime} min
              </p>
            </div>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
          {/* TOP BAR */}
          <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                New Blog Post
              </h2>
              <p className="text-sm text-gray-500">Fill in the details below</p>
            </div>

            <button
              onClick={() => setPreview(!preview)}
              className="flex items-center justify-center gap-2 rounded-2xl border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-50"
            >
              <Eye size={16} />
              {preview ? "Preview Mode" : "Editor Mode"}
            </button>
          </div>

          {/* BODY */}
          <div className="p-3 sm:p-8 md:p-10">
            {/* THUMBNAIL */}
            <FormField label="Thumbnail">
              <label className="group relative flex h-60 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-purple-400 hover:bg-purple-50">
                {thumbnailFile ? (
                  <img
                    src={thumbnailPreview}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <div className="rounded-2xl bg-white p-4 shadow-sm transition group-hover:scale-105">
                      <Upload size={30} className="text-purple-600" />
                    </div>
                    <p className="mt-4 text-base font-medium text-gray-700">
                      Upload Thumbnail
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setThumbnailFile(file);
                      const previewUrl = URL.createObjectURL(file);
                      setThumbnailPreview(previewUrl);
                    }
                  }}
                />
              </label>
            </FormField>
            {/* TITLE */}
            <FormField label="Blog Title" required>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                maxLength={CHARACTER_LIMITS.TITLE}
                placeholder="Write an attention-grabbing title..."
                className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-lg font-semibold text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100"
              />
              <CharacterCounter
                current={formData.title.length}
                max={CHARACTER_LIMITS.TITLE}
              />
            </FormField>
            {/* EXCERPT */}
            <FormField label="Short Excerpt">
              <textarea
                rows={4}
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                maxLength={CHARACTER_LIMITS.EXCERPT}
                placeholder="Write a compelling summary..."
                className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-gray-700 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100"
              />
              <CharacterCounter
                current={formData.excerpt.length}
                max={CHARACTER_LIMITS.EXCERPT}
              />
            </FormField>
            {/* CONTENT */}
            {/* CONTENT */}{" "}
            <FormField label="Blog Content" required>
              {" "}
              {!preview ? (
                <RichTextEditor
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, content: value }))
                  }
                />
              ) : (
                <div
                  className="prose prose-lg max-w-none min-h-[400px] rounded-3xl border border-gray-200 bg-[#fcfcfc] p-6"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              )}{" "}
            </FormField>
            {/* CATEGORY + TAGS */}
            <div className="mb-8 grid gap-6 md:grid-cols-2">
              {/* CATEGORY */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* TAGS */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tags
                </label>

                <div className="relative">
                  <Hash
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tag and press Enter"
                    className="w-full rounded-2xl border border-gray-200 py-4 pl-10 pr-4 text-gray-700 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100"
                  />
                </div>

                {/* TAG LIST */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700"
                    >
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* FEATURED */}
            <div className="mb-8 flex items-center justify-between rounded-3xl border border-gray-200 bg-gray-50 p-5">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Feature this blog
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Featured blogs appear prominently on homepage.
                </p>
              </div>

              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="h-7 w-12 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-6 after:w-6 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-600 peer-checked:after:translate-x-full"></div>
              </label>
            </div>
            {/* ACTION BUTTONS */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => handleSubmit("draft")}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-4 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {loading ? "Saving..." : "Save Draft"}
              </button>

              <button
                onClick={() => handleSubmit("published")}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-purple-600 px-6 py-4 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={18} />
                {loading ? "Publishing..." : "Publish Blog"}
              </button>
            </div>
          </div>
        </div>

        {/* WRITING TIPS */}
        <div className="mt-6 rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-purple-100 p-3 text-purple-600">
              <BookOpen size={22} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Writing Tips
              </h3>
              <div className="mt-3 space-y-2 text-sm text-gray-500">
                <p>• Use headings to structure your article</p>
                <p>• Keep paragraphs short for better readability</p>
                <p>• Add examples and personal experiences</p>
                <p>• Use tags smartly for better discoverability</p>
                <p>• End with a strong conclusion or CTA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;
