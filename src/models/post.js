import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
    },
    Image_Video_url: {
      type: String,
      required: true,
    },
    Likes: [
      {
        user_id: {
          type: mongoose.Schema.ObjectId,
          ref: "users",
        },
      },
    ],
    Comments: [],
    Report: [
      {
        user_id: {
          type: mongoose.Schema.ObjectId,
          ref: "users",
        },
        report: {
          type: String,
        },
      },
    ],
    PostContent: {
      type: String,
    },
    Date: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

const postModel = mongoose.model("posts", postSchema);

export default postModel;
