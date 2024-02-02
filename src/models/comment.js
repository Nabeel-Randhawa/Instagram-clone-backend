import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    depth: {
      type: Number,
      default: 1
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    postedDate: { type: Date, default: Date.now },
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
    },
    commentText: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

const commentModel = mongoose.model("comments", commentSchema);

export default commentModel;
