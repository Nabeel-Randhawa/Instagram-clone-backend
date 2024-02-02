import { Router } from "express";
import postController from "../controllers/post.js";
import PostValidator from "../validator/PostValidator.js";
import ReportValidator from "../validator/ReportValidator.js";
import authMiddleware from "../middleware/authMiddleware.js";
const postRouter = new Router();

postRouter.get("/posts", postController.getAllPost);
postRouter.get("/post/:id", postController.getSinglePost);

postRouter.post("/post", authMiddleware, postController.createPost);
postRouter.put("/post/:id",PostValidator.updatePost,postController.updatePost);
postRouter.delete("/post/:id", authMiddleware , postController.deletePost);
postRouter.post("/post/like", postController.likePost);
postRouter.post("/post/dislike", postController.disLikePost);
postRouter.post("/post/report",ReportValidator.createReport, postController.reportPost);
postRouter.get("/postofuser/:userId", authMiddleware, postController.postOfUser);
postRouter.get("/postFollowed",authMiddleware, postController.getAllPostUserFollowing);
postRouter.get("/post/toggleLike/:post_id", authMiddleware ,postController.toggleLikeDislikePost);


export default postRouter;

