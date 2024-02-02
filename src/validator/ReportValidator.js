import joi from "joi";
import EHttpStatusCode from "../enums/HttpStatusCode.js";

const ReportValidator = {
  createReport: (req, res, next) => {
    const schema = joi.object({
      Report: joi.array().items({
        user_id: joi.string().required(),
        report: joi.string().required().min(5).max(200),
      }),
    });
    const validate = schema.validate(req.body);
    if (validate.error) {
      return res
        .status(EHttpStatusCode.BAD_REQUEST)
        .json({ message: validate.error.details[0].message });
    }
    next();
  }
};
export default ReportValidator;






