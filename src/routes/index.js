import { Router } from "express";
import userRouter from "./user.js";
import authRouter from "./auth.js";
import postRouter from "./post.js";
import commentRouter from "./comments.js";

const mainRouter = new Router();

// mainRouter.use(authRouter);
mainRouter.use(userRouter);
mainRouter.use(authRouter);
mainRouter.use(postRouter);
mainRouter.use(commentRouter);
export default mainRouter;
