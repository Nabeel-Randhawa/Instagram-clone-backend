import EHttpStatusCode from "../enums/HttpStatusCode.js";
import jwt from "jsonwebtoken";

import env from "dotenv";
env.config();

const authMiddleware = (req, res, next) => {
  try {
    //request processing pipline
    let token = req.headers.authorization;
    // console.log(token , "before")
    if (!token && token != "undefined") {
      return res
        .status(EHttpStatusCode.UNAUTHORIZED)
        .json({ message: "Not Authorized!" });
    }
    token = token.split(" ")[1];
    // console.log(token , "after")
    let user = jwt.verify(token, process.env.SECRET_KEY, {});
    // console.log(user)
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(EHttpStatusCode.INTERNAL_SERVER)
      .json({ message: "Internal Server Error!" });
  }
};

export default authMiddleware;
