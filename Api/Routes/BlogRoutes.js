import express from "express";

import upload from "../Middlewares/multer.js";
import auth from "../Middlewares/auth.js";

import {
  createBlog,
  getMyBlogs,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
} from "../Controllers/Blogs.js";

const router = express.Router();

// CREATE BLOG
router.post("/create", auth, upload.single("thumbnail"), createBlog);

// GET MY BLOGS
router.get("/my-blogs", auth, getMyBlogs);
           
// GET ALL PUBLISHED BLOGS
router.get("/", getAllBlogs);

// GET SINGLE BLOG
router.get("/:id", getSingleBlog);

// UPDATE BLOG
router.put("/update/:id", auth, upload.single("thumbnail"), updateBlog);

// DELETE BLOG
router.delete("/delete/:id", auth, deleteBlog);

// LIKE / UNLIKE BLOG
router.put("/like/:id", auth, likeBlog);

export default router;
