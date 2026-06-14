import { Blog } from "../Models/Blogs.js";
import cloudinary from "../config/cloudinary.js";
import slugify from "slugify";

// CREATE BLOG
export const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, status, isFeatured } =
      req.body;

    const userId = req.user.id;

    // thumbnail upload
    let thumbnail = "";

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "mern_blog_thumbnails",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(req.file.buffer);
      });

      thumbnail = result.secure_url;
    }

    // calculate reading time
    const wordsPerMinute = 200;
    const wordCount = content.split(" ").length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);

    const newBlog = await Blog.create({
      title,
      excerpt,
      content,
      thumbnail,
      category,
      tags: tags ? tags.split(",") : [],
      author: userId,
      status,
      isFeatured,
      readingTime,
      publishedAt: status === "published" ? new Date() : null,
    });

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MY BLOGS
export const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      author: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL PUBLISHED BLOGS
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      status: "published",
    })
      .populate("author", "name profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE BLOG
export const getSingleBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "name profilePic",
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // increase views
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE BLOG
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // ownership check
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { title, content, excerpt, category, tags, status, isFeatured } =
      req.body;

    // update thumbnail if new image uploaded
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "mern_blog_thumbnails",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(req.file.buffer);
      });

      blog.thumbnail = result.secure_url;
    }

    // update fields
    if (title) {
      blog.title = title;

      blog.slug = slugify(title, {
        lower: true,
        strict: true,
      });
    }

    if (content) {
      blog.content = content;

      const wordsPerMinute = 200;
      const wordCount = content.split(" ").length;

      blog.readingTime = Math.ceil(wordCount / wordsPerMinute);
    }

    if (excerpt) blog.excerpt = excerpt;
    if (category) blog.category = category;

    if (tags) {
      blog.tags = tags.split(",");
    }

    if (status) {
      blog.status = status;

      if (status === "published" && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }

    if (typeof isFeatured !== "undefined") {
      blog.isFeatured = isFeatured;
    }

    await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE BLOG
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({
      _id: req.params.id,
      author: req.user.id,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LIKE / UNLIKE BLOG
export const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const userId = req.user.id;

    const alreadyLiked = blog.likes.includes(userId);

    if (alreadyLiked) {
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
    } else {
      blog.likes.push(userId);
    }

    await blog.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Blog unliked" : "Blog liked",
      totalLikes: blog.likes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
