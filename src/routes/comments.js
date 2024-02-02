import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware.js";
import commentController from "../controllers/comments.js";
import authMiddleware from "../middleware/authMiddleware.js";


const commentRouter = new Router();
commentRouter.post("/newPostComment",authMiddleware ,  commentController.addComment);
commentRouter.get("/Comment/:post_id" ,authMiddleware ,commentController.getComments);
commentRouter.delete("/Comment/:comment_id" ,authMiddleware ,commentController.deleteComment);
commentRouter.post("/comment/:comment_id" ,authMiddleware ,commentController.updateComment);



export default commentRouter;
