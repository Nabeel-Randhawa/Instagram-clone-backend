import EHttpStatusCode from "../enums/HttpStatusCode.js";
import bcrypt from "bcrypt";
import userModel from "../models/user.js";
import signInMail from "../email/auth/signIn.js";
import signUpMail from "../email/auth/signUp.js";
import jwt from "jsonwebtoken";
import commentModel from "../models/comment.js";


const commentController = {
    addComment: async (req, res) => {
        try {
            console.log("add New Comment");
            const userId = req.user._id; // Corrected 're' to 'req'
            const { postId, commentText } = req.body;
            console.log(postId)

            // Create an empty 'data' object to be filled with optional properties
            const data = {};

            if ('parentId' in req.body) {
                data.parentId = req.body.parentId;
            }
            if ('depth' in req.body) {
                data.depth = req.body.depth;
            }

            // Create a new Comment instance with the 'data' object
            const comment = await commentModel.create({
                user_id: userId, // Assuming you have a 'userId' field in the Comment schema
                postId: postId,
                commentText: commentText,
                ...data, // Spread the 'data' object to include optional properties
            });


            return res
                .status(EHttpStatusCode.CREATED)
                .json({ message: "Comment successfully", comment });
        } catch (error) {
            console.log(error);
        }
    },
    updateComment: (req, res) => {
        let comment = req.body;
        Comment.updateOne({ _id: comment.id }, { $set: { commentText: comment.commentText } })
            .exec()
            .then(result => res.status(200).json({
                message: "Comment Updated",
                comment: comment
            }))
            .catch(err => res.status(500).json({ error: err }))
    },

    getComments: (req, res) => {
        console.log("finding Comments");

        commentModel
            .find({ postId: req.params.post_id })
            .populate("user_id")
            .sort({ postedDate: 1 })
            .lean()
            .exec()
            .then((comments) => {
                let threads = {}; // Initialize the threads object

                // Function to recursively add comments to the threads
                function addToThreads(comment) {
                    if (!comment.parentId) {
                        // If it's a top-level comment, add it to threads directly
                        threads[comment._id] = comment;
                    } else {
                        // If it's a reply, find the parent comment and add it as a child
                        const parentComment = threads[comment.parentId];
                        if (parentComment) {
                            if (!parentComment.children) {
                                parentComment.children = {};
                            }
                            parentComment.children[comment._id] = comment;
                        }
                    }

                    // Recursively process any child comments
                    if (comment.children) {
                        for (const childId in comment.children) {
                            addToThreads(comment.children[childId]);
                        }
                    }
                }

                // Process each comment and add it to the threads
                for (let i = 0; i < comments.length; i++) {
                    addToThreads(comments[i]);
                }

                console.log(threads, "threads");
                res.json({
                    count: comments.length,
                    comments: threads,
                });
            })
            .catch((err) => res.status(500).json({ error: err }));
    },
    deleteComment: async (req, res) => {
        try {
            const comment_id = req.params.comment_id;
            if (!comment_id) {
                return res
                    .status(EHttpStatusCode.NOT_FOUND)
                    .json({ message: "Comment Id Not Found" });
            }
            const comment = await commentModel.findByIdAndDelete(comment_id);
            if (!comment) {
                return res
                    .status(EHttpStatusCode.NOT_FOUND)
                    .json({ message: "Comment Not Found!" });
            }
            return res
                .status(EHttpStatusCode.SUCCESS)
                .json({ message: "Comment Deleted Successfully" });

        } catch (error) {
            console.log(`Comment Deletion Error: ${error.message}`);
            return res
                .status(EHttpStatusCode.INTERNAL_SERVER)
                .json({ message: "Internal Server Error!" });
        }
    }

};

export default commentController;
