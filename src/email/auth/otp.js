import Transport from "../../config/nodemailer.js";
import env from "dotenv";
env.config();

const otpMail= ({email , otp}) => {
  console.log(email , "OTP email Function Called")
  let option = {
    from: process.env.EMAIL_SENDER,
    to: email,
    subject: " Wellcome to Instagram",
    text: `Otp is ${otp}`,
    html: `<b>Hey </b> Otp is ${otp} <br> This is our first message sent with Nodemailer after login <br />`,
  };

  Transport.sendMail(option, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: ", info);
  });
};

export default otpMail;
