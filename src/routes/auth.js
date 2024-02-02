import { Router } from "express";
import authController from "../controllers/auth.js";

const authRouter = new Router();
authRouter.post("/login", authController.Login);
authRouter.post("/token", authController.Token);
authRouter.post("/logout", authController.Logout);
authRouter.post("/signup", authController.signUp);
authRouter.post("/confirmOtp", authController.checkOtp);
authRouter.post("/refreshOtp", authController.regenerateOtp);

export default authRouter;

// Refresh Token and Logout token helpful article
// https://stackabuse.com/authentication-and-authorization-with-jwts-in-express-js/
