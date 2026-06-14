import express from "express";
import { signup, login, profile, updateProfile } from "../Controllers/Users.js";
import auth from "../Middlewares/auth.js";
import upload from "../Middlewares/multer.js";

const router = express.Router();

// signup route
router.post("/signup", signup);

// login route
router.post("/login", login);

//profile route

router.get("/me", auth, profile);

router.put("/me", auth, upload.single("profilePic"), updateProfile);

export default router;
