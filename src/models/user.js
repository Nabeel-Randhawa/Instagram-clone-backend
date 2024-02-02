import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    imageUrl:{
      type: "string",
      default: "https://res.cloudinary.com/dwlmgckgg/image/upload/v1696854667/yf9gdc96fse0msfsbs2e.jpg"
    },
    userName: {
      type: "string",
    },
    fullName: {
      type: "string",
    },
    email: {
      type: "string",
    },
    gender: {
      type: "string",
    },
    password: {
      type: "string",
    },
    number: {
      type: "number",
    },
    bio: {
      type: "string",
    },
    DOB: {
      type: "string",
    },
    followers: [
      {
        user_id: {
          type: mongoose.Schema.ObjectId,
          ref: "users",
        },
      },
    ],
    following: [
      {
        user_id: {
          type: mongoose.Schema.ObjectId,
          ref: "users",
        },
      },
    ],
    saved_posts: [
      {
        post_id: {
          type: mongoose.Schema.ObjectId,
          ref: "posts",
        },
      },
    ],
    posts: [
      {
        post_id: {
          type: mongoose.Schema.ObjectId,
          ref: "posts",
        },
      },
    ],
    story: [
      {
        user_id: {
          type: mongoose.Schema.ObjectId,
          ref: "users",
        },
        url: {
          type: "string",
        },
        expirationTime: {
          type: "date",
          default: Date.now() + 24 * 60 * 60 * 1000,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("users", userSchema);

export default userModel;
