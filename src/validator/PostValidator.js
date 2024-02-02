import joi from "joi";
import EHttpStatusCode from "../enums/HttpStatusCode.js";

const PostValidator = {
  createPost: (req, res, next) => {
    const schema = joi.object({
      PostContent: joi.string().min(3).max(40).required(),
      Image_Video_url: joi.string().max(50).required(),
    });
    const validate = schema.validate(req.body);
    if (validate.error) {
      return res
        .status(EHttpStatusCode.BAD_REQUEST)
        .json({ message: validate.error.details[0].message });
    }
    next();
  },

  updatePost: (req, res, next) => {
    const schema = joi.object({
      PostContent: joi.string().min(3).max(40).required(),
      Image_Video_url: joi.string().max(50).required(),
    });
    const validate = schema.validate(req.body);
    if (validate.error) {
      return res
        .status(EHttpStatusCode.BAD_REQUEST)
        .json({ message: validate.error.details[0].message });
    }
    next();
  },
};
export default PostValidator;
