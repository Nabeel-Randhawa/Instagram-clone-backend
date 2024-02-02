import userModel from "../models/user.js";
import postModel from "../models/post.js";
import bcrypt from "bcrypt";
import EHttpStatusCode from "../enums/HttpStatusCode.js";
import signUpMail from "../email/auth/signUp.js";

const UserController = {

  profilePicture: async (req, res) => {
    try {
      const userId = req.user._id;
      const { imageUrl } = req.body;
      console.log("profilepicture");
      console.log(imageUrl);
      if (!imageUrl) {
        return res.status(404).json({ message: 'Url not  found' });
      }

      // Update the user's profile picture URL
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { imageUrl: imageUrl },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      console.log(updatedUser)

      return res.status(200).json({ message: 'Profile picture updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Error updating profile picture:', error.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  savePost: async (req, res) => {
    try {
      const id = req.body.post_id;
      if (!id) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Post Id Not Found" });
      }

      const post = await postModel.findById(id);
      if (!post) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Post Not Found!" });
      }

      const userId = req.user._id;
      await userModel.findByIdAndUpdate(userId, {
        $push: { savedPosts: post._id },
      });

      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ message: "Post Saved Successfully! Post id: ", id });
    } catch (err) {
      console.log(`Saving Post Error ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },

  unsavePost: async (req, res) => {
    try {
      const userId = req.user._id;
      const postId = req.body.post_id;

      const user = await userModel.findById(userId);
      if (!user) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "User not found!" });
      }

      if (!user.saved_posts.includes(postId)) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json({ message: "Post not found in saved posts!" });
      }

      user.saved_posts.pull(postId);
      await user.save();

      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ message: "Successfully removed the post from saved posts!" });
    } catch (err) {
      console.log(`Unsave Post Error ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },
  toggleSavePost: async (req, res) => {
    try {
      const userId = req.user._id;
      const postId = req.params.post_id;

      const user = await userModel.findById(userId);
      if (!user) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "User not found!" });
      }
      user.saved_posts.map((savedPost) => console.log(savedPost))
      const isPostSavedIndex = user.saved_posts.findIndex((saved) => {
        console.log(saved)
        return (saved.post_id == postId)
      });
      console.log(isPostSavedIndex, "savedPOstIndex")
      if (isPostSavedIndex !== -1) {
        // Unsave the post
        user.saved_posts.splice(isPostSavedIndex, 1);
        await user.save();
        return res
          .status(EHttpStatusCode.SUCCESS)
          .json({ message: "Successfully removed the post from saved posts!" });
      } else {
        // Save the post
        user.saved_posts.push({ post_id: postId });
        await user.save();
        return res
          .status(EHttpStatusCode.SUCCESS)
          .json({ message: "Post Saved Successfully! Post id: ", id: postId });
      }
    } catch (err) {
      console.log(`Toggle Save/Unsave Post Error ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },


  followUser: async (req, res) => {
    try {
      //   const follower = req.body.follower[0];
      //   const followerId = follower.user_id;
      const followerId = req.user._id;
      const { followingId } = req.body;

      console.log(followerId);
      console.log(followingId);

      const userToFollow = await userModel.findById(followerId);

      if (!userToFollow) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "User to follow not found!" });
      }

      if (userToFollow.followers.some(f => f.user_id.toString() === followerId)) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json({ message: "You are already following this user!" });
      }

      await userModel.updateOne(
        { _id: followerId },
        { $addToSet: { following: { user_id: followingId } } }
      );

      await userModel.updateOne(
        { _id: followingId },
        { $addToSet: { followers: { user_id: followerId } } }
      );

      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ message: "Successfully followed the user!" });
    } catch (err) {
      console.log(`Follow User Error ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },

  unfollowUser: async (req, res) => {
    try {
      //   const Follower = req.body.follower[0];
      //   const followerId = Follower.user_id;
      const followerId = req.user._id;
      const following = req.body.following[0];
      const followingId = following.user_id;

      console.log(followerId);
      console.log(followingId);

      const userToUnfollow = await userModel.findById(followingId);
      if (!userToUnfollow) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "User to unfollow not found!" });
      }
      if (
        !userToUnfollow.followers.some(
          (f) => f.user_id.toString() === followerId
        )
      ) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json({ message: "You are not following this user!" });
      }

      userToUnfollow.followers.pull(followerId);

      await userModel.updateOne(
        { _id: followerId },
        { $pull: { following: { user_id: followingId } } }
      );

      await userModel.updateOne(
        { _id: followingId },
        { $pull: { followers: { user_id: followerId } } }
      );

      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ message: "Successfully unfollowed the user!" });
    } catch (err) {
      console.log(`Unfollow User Error ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },
  toggleFollowUser: async (req, res) => {
    try {
      const followerId = req.user._id;
      const { followingId } = req.params;

      console.log(followerId);
      console.log(followingId);

      // Find the follower and following users by their IDs
      const followerUser = await userModel.findById(followerId);
      const followingUser = await userModel.findById(followingId);

      if (!followingUser) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "User to Follow not found!" });
      }

      // Check if the user's ID is in the following array.
      const isFollowing = followingUser.followers.some(f => f.user_id.toString() === followerId.toString());
      console.log(isFollowing, "isFollowing");

      if (isFollowing) {
        // User is already following, unfollow the user
        followingUser.followers = followingUser.followers.filter(f => f.user_id.toString() !== followerId.toString());
        await followingUser.save();

        await userModel.updateOne(
          { _id: followerId },
          { $pull: { following: { user_id: followingId } } }
        );

        const followerUser = await userModel.findById(followerId);

        return res
          .status(EHttpStatusCode.SUCCESS)
          .json({ message: "Unfollowed the user", user: followerUser });
      } else {
        // User is not following, follow the user
        followingUser.followers.push({ user_id: followerId });
        await followingUser.save();

        await userModel.updateOne(
          { _id: followerId },
          { $addToSet: { following: { user_id: followingId } } }
        );
        const followerUser = await userModel.findById(followerId);

        return res
          .status(EHttpStatusCode.SUCCESS)
          .json({ message: "Followed the user", user: followerUser });
      }
    } catch (err) {
      console.log(`Toggle Follow User Error: ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error!" });
    }
  },



  getSingleUser: async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log(userId)
      const user = await userModel.findById(userId);
      console.log(user)
      if (!user) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "User not found!" });
      }
      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ user });
    } catch (error) {
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },

  getUserSinglePost: async (req, res) => {
    try {
      const userId = req.user._id;
      const Post = req.params;
      const postId = Post.id;

      // Check if the user exists
      const user = await userModel.findById(userId);
      if (!user) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "User not found!" });
      }
      console.log(userId);
      console.log(postId);
      // Check if the user has the specified post
      const post = user.posts.find(post => post._id.toString() === postId);
      if (!post) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Post not found!" });
      }

      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ post });
    } catch (err) {
      console.log(`Get User Single Post Error ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },


  getPostsOfUser: async (req, res) => {
    try {
      const userId = req.user._id;

      // Check if the user exists
      const posts = await postModel.find({ user_id: userId }).populate("user_id").sort({ createdAt: -1 });


      return res.status(EHttpStatusCode.SUCCESS).json({ posts });
    } catch (err) {
      console.log(`Get User Posts Error ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },

  addStoryToUser: async (req, res) => {
    try {
      const id = req.user._id;
      const user = await userModel.findById(id);
      if (!user) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "User not found!" });
      }
      const { url } = req.body;
      const currentTimestamp = new Date().getTime();

      if (user.story.length > 0) {
        const mostRecentStory = user.story[user.story.length - 1];

        // Check if the most recent story is still valid (expiration time is in the future)
        if (mostRecentStory.expirationTime > currentTimestamp) {
          return res.status(EHttpStatusCode.BAD_REQUEST).json({
            message: "User can have only one valid story within 24 hours.",
          });
        }
      }

      // Create a new story with a 24-hour expiration time
      const newStory = {
        url,
        createdAt: currentTimestamp,
        expirationTime: currentTimestamp + 24 * 60 * 60 * 1000, // Set expiration time 24 hours from now
      };
      user.story.push(newStory);
      await user.save();

      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ message: "Story added successfully!" });
    } catch (err) {
      console.log(`Add User Story Error ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },

  deleteStoryFromUser: async (req, res) => {
    try {
      const userId = req.user._id;
      const storyId = req.body.story;

      // Check if the user exists
      const user = await userModel.findById(userId);
      if (!user) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "User not found!" });
      }

      const storyIndex = user.story.findIndex((story) => story._id == storyId);

      if (storyIndex === -1) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "Story not found!" });
      }
      user.stories.splice(storyIndex, 1);

      await user.save();

      return res
        .status(EHttpStatusCode.SUCCESS)
        .json({ message: "Story deleted successfully!" });
    } catch (err) {
      console.log(`Delete User Story Error ${err.message}`);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },

  searchUserByUserName: async (req, res) => {
    try {
      const { userName } = req.body;
      // const { limit, page, sortField, sortOrder } = req.query;
      console.log(userName)
      const query = userModel.find({
        userName: { $regex: `.*${userName}.*`, $options: 'i' },
      });
      console.log(query)


      const users = await query.exec();
      console.log(users)

      if (!users || users.length === 0) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "No users found" });
      }

      return res.status(EHttpStatusCode.SUCCESS).json({ users });
    } catch (error) {
      console.error(error);
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error!" });
    }
  },


  update: async (req, res) => {
    const body = req.body;
    console.log(body)
    const id = req.user._id;
    const user = await userModel.findById(id);
    if (!user) {
      return res
        .status(EHttpStatusCode.NOT_FOUND)
        .json({ message: "User not found" });
    }
    user.fullName = body.fullName;
    user.gender = body.gender;
    user.bio = body.bio;
    user.DOB = body.DOB;

    await user.save();
    return res
      .status(EHttpStatusCode.SUCCESS)
      .json({ message: "User Updated successfully", user });
  },

  getUserStory: async (req, res) => {
    const id = req.user._id;

    try {
      console.log(`User Logged ID : ${id}`);
      if (!id) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json({ message: "User Not Found, Re-Login" });
      }
      const user = await userModel.findOne({ _id: id });
      console.log(`User Logged: ${user}`);
      if (!user) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "User Not Found!" });
      }

      const stories = user.story || [];
      console.log(`User Stories : ${stories}`);

      const currentTimestamp = new Date().getTime();
      const validStories = stories.filter((story) => {
        return story.expirationTime > currentTimestamp;
      });

      if (validStories.length === 0) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "No Valid Stories Found!" });
      }
      console.log(`Valid Stories: ${validStories}`);
      return res.status(EHttpStatusCode.SUCCESS).json({
        message: "Valid Stories Of Logged User Found!",
        stories: validStories,
      });
    } catch (error) {
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Server Error" });
    }
  },

  getUserFollowingStory: async (req, res) => {
    try {
      console.log("Getting user Post following")
      const id = req.user._id; // Assuming you have the authenticated user's ID
      console.log(`Authenticated User ID: ${id}`);
      if (!id) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json({ message: "User Not Found, Re-Login" });
      }
      // Find the authenticated user by _id
      const user = await userModel
        .findOne({ _id: id })
        .populate("following.user_id");
      console.log(`Authenticated Followed user: ${user}`);
      console.log(user , "users for story")
      if (!user) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "User Not Found!" });
      }

      // Extract the list of users the authenticated user is following
      const followingUsers = user.following.map((follow) => follow.user_id);
      console.log(`Authenticated Followed user array: ${followingUsers}`);

      // Retrieve followed user IDs with valid stories
      const followedUserIdsWithValidStories = followingUsers
        .filter((followingUser) => {
          const currentTimestamp = new Date().getTime();
          const validStories = (followingUser.story || []).filter(
            (story) => story.expirationTime > currentTimestamp
          );

          return validStories.length > 0;
        })
        // .map((user) => user._id);
      console.log(
        `Followed User IDs with Valid Stories: ${followedUserIdsWithValidStories}`
      );

      if (followedUserIdsWithValidStories.length === 0) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "No Followed Users with Valid Stories Found!" });
      }

      return res.status(EHttpStatusCode.SUCCESS).json({
        message: "Followed Users with Valid Stories Found!",
        followedUserIds: followedUserIdsWithValidStories,
      });
    } catch (error) {
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Server Error" });
    }
  },
  getStoryOfSpecificId: async (req, res) => {
    try {
      const user_id = req.body.id;
      console.log(`Specfic User ID: ${user_id}`);
      if (!user_id || user_id.length === 0) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json({ message: "User ID is required!" });
      }
      const user = await userModel.findOne({ _id: user_id });
      if (!user) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "User Not Found!" });
      }
      const stories = user.story || [];
      console.log(`User Stories : ${stories}`);

      const currentTimestamp = new Date().getTime();
      const validStories = stories.filter((story) => {
        return story.expirationTime > currentTimestamp;
      });

      if (validStories.length === 0) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json({ message: "No Valid Stories Found!" });
      }
      console.log(`Valid Stories: ${validStories}`);
      return res.status(EHttpStatusCode.SUCCESS).json({
        message: "Valid Story Of User Found!",
        stories: validStories,
      });
    } catch (error) {
      return res
        .status(EHttpStatusCode.INTERNAL_SERVER)
        .json({ message: "Internal Server Error" });
    }
  },
};

export default UserController;
