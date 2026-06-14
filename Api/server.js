import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRouter from "./Routes/userRouter.js";
import blogRoutes from "./Routes/BlogRoutes.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
mongoose
  .connect(process.env.MONGOURL, { dbName: "Social_Media_App" })
  .then(() => console.log("MongoDb connected Successfully"))
  .catch((err) => console.log(err));

app.use("/api/users", userRouter);
app.use("/api/blogs", blogRoutes);

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`server is running on port ${port}`));
