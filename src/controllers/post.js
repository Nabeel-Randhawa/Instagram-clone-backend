import postModel from "../models/post.js";

import EHttpStatusCode from "../enums/HttpStatusCode.js";
import userModel from "../models/user.js";
const postController = {

  postOfUser: async (req, res) => {
    try {
      const userId = req.params.userId;
      // console.log(userId);
      const posts = await postModel.find({ user_id: userId });
      // console.log(posts)
      res.status(200).json({ posts });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },


  getAllPost: async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
      const posts = await postModel
        .find()
        .sort({ createdAt: -1 }) // Sort by createdAt in ascending order
      // .limit(limit * 1)
      // .skip((page - 1) * limit)
      // .exec();

      if (!posts || posts.length === 0) {
        return res.status(EHttpStatusCode.NOT_FOUND).json({ message: "Posts Not Found!", posts: [] });
      }

      const count = await postModel.countDocuments();
      const totalPages = Math.ceil(count / limit);
      res.status(EHttpStatusCode.SUCCESS).json({ posts, totalPages, currentPage: page });
    } catch (err) {
      console.error(`All Posts Error: ${err.message}`);
      return res.status(EHttpStatusCode.INTERNAL_SERVER).json({ message: "Internal Server Error!" });
    }
  },

  getSinglePost: async (req, res) => {
    console.log("get single api");
    try {
      const { id } = req.params;
      if (!id) {
        console.log(`post id: ${id}`);
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Post id Not Found!" });
      }
      const post = await postModel.findById(id).populate("user_id");
      if (!post) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Post Not Found!" });
      }
      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ message: "Post Found", post });
    } catch (err) {
      console.log(`Single Post Error: ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },
  createPost: async (req, res) => {
    console.log("get create api");
    try {
      const user_id = req.user._id;
      console.log(user_id)
      const postData = req.body;
      console.log(postData)
      if (!postData) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Post Content Not Found!" });
      }
      postData.user_id = user_id;
      const post = await postModel.create(postData);
      console.log(post)
      const user = await userModel.findById(user_id);
      console.log(user)
      user.posts.push({ post_id: post._id });

      await user.save();

      return res
        .status(EHttpStatusCode.CREATED)
        .json({ message: "Post created successfully", post, user });
    } catch (err) {
      console.log(`Post Creation Error: ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },
  updatePost: async (req, res) => {
    console.log("get update api");
    try {
      const id = req.params.id;
      if (!id) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Post Id Not Found" });
      }
      const postData = req.body;
      if (!postData) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Post Content Not Found!" });
      }
      const post = await postModel.findById(id);
      if (!post) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Post Not Found!" });
      }
      post.Image_Video_url = postData.Image_Video_url;
      post.PostContent = postData.PostContent;

      await post.save();
      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ message: "Post Updated Successfully", post });
    } catch (error) {
      console.log(`Post Updation Error: ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },
  deletePost: async (req, res) => {
    console.log("Delete post API");
    try {
      const post_id = req.params.id;
      const userId = req.user._id;

      if (!post_id) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Post Id Not Found" });
      }

      const post = await postModel.findByIdAndDelete(post_id);

      if (!post) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Post Not Found!" });
      }

      const user = await userModel.findById(userId);

      // Find the index of the post in the user's posts array
      console.log(post_id , "Post ID")
      const index = user.posts.findIndex((post) => {
        console.log(post.post_id)
        return (post.post_id == post_id)
      });
      console.log(index)
      if (index !== -1) {
        // Remove the post from the user's posts array
        user.posts.splice(index, 1);
      }

      await user.save();

      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ message: "Post Deleted Successfully", user });
    } catch (err) {
      console.error(`Post Deletion Error: ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },

  likePost: async (req, res) => {
    console.log("get like api");
    try {
      const user_id = req.user._id;
      if (!user_id) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json({ message: "Login and try again!" });
      }
      const post_id = req.body;
      const post = await postModel.findById(post_id);
      if (!post_id) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Post Not Found, try again!" });
      }

      post.Likes = post.Likes.push(post_id);
      await post.save();
      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ message: "Post Liked Successfully", post });
    } catch (err) {
      console.log(`Post Like Error: ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },
  disLikePost: async (req, res) => {
    console.log("get dislike api");
    try {
      const user_id = req.user._id;
      if (!user_id) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json({ message: "Login and try again!" });
      }
      const post_id = req.body;
      const post = await postModel.findById(post_id);
      if (!post_id) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Post Not Found, try again!" });
      }

      post.Likes = post.Likes.pop(post_id);
      await post.save();
      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ message: "Post Disliked Successfully", post });
    } catch (err) {
      console.log(`Post Disliked Error: ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },
  toggleLikeDislikePost: async (req, res) => {
    console.log("Toggle Like/Dislike Post API");
    try {
      const user_id = req.user._id;
      if (!user_id) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json({ message: "Login and try again!" });
      }

      const post_id = req.params.post_id; // Assuming you pass the post_id in the request body.
      const post = await postModel.findById(post_id);

      if (!post) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Post Not Found, try again!" });
      }

      // Check if the user's ID is in the Likes array.
      console.log(user_id)
      post.Likes.map((like) => console.log(like))
      const userLikedIndex = post.Likes.findIndex((like) => {
        return (like.user_id == user_id)
      });
      console.log(userLikedIndex)

      if (userLikedIndex !== -1) {
        post.Likes.splice(userLikedIndex, 1);
      } else {
        post.Likes.push({ user_id });
      }

      await post.save();
      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ message: "Toggle Like/Dislike Successful", post });
    } catch (err) {
      console.log(`Toggle Like/Dislike Post Error: ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },

  reportPost: async (req, res) => {
    try {
      const user_id = req.user._id;
      if (!user_id) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json({ message: "Login and try again!" });
      }
      const post_id = req.body;
      const post = await postModel.findById(post_id);
      if (!post_id) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Post Not Found, try again!" });
      }

      post.Report = {
        user_id: user_id,
        report: req.body.report,
      };
      await post.save();
      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ message: "Post Reported Successfully", post });
    } catch (err) {
      console.log(`Post Reporting Error: ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },
  getAllPostUserFollowing: async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    console.log("get all Following api");
    try {
      const user_id = req.user._id;
      if (!user_id) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json({ message: "Login and try again!" });
      }
      // Find the user by their ID
      const user = await userModel.findById(user_id);
      console.log(user)
      if (!user) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "User not found!" });
      }
      const usersFollowed = user.following;
      // console.log(usersFollowed)
      // Retrieve posts from users that the current user is following
      const retrievePosts = await postModel
        .find({
          user_id: { $in: usersFollowed.map(obj => obj.user_id) },
        }).populate("user_id").sort({ createdAt: -1 });
      // .limit(limit * 1)
      // .skip((page - 1) * limit)
      // .exec();
      // console.log(retrievePosts)
      if (!retrievePosts)
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Posts Not Found!", retrievePosts });
      const count = await postModel.countDocuments();
      const totalPages = Math.ceil(count / limit);
      // Return the retrieved posts
      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ retrievePosts, totalPages, currentPage: page });
    } catch (err) {
      console.log(`Followed Post Error: ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },
};
export default postController;
