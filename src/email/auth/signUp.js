import Transport from "../../config/nodemailer.js";
import env from "dotenv";
env.config();

const signUp = (userName, userEmail, otp) => {
  console.log(
    `{ Email Parameters Nodemail--->  name: ${userName} ,email: ${userName}, otp: ${otp} }`
  );
  if (otp && userEmail) {
    const option = {
      from: process.env.EMAIL_SENDER,
      to: userEmail,
      subject: "Instagram Registration ",
      text: "Hey , Nice you have on our Platform ",
      html: `<b>Hey Otp is ${otp}! </b><br> This is our first interaction, Here's the Otp for Account Confirmation <strong>${otp}</strong><br />`,
    };

    Transport.sendMail(option, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message sent: ", info.messageId);
    });
  } else {
    console.log(`OTP is ${otp} and Email to ${userEmail}`);
  }
};

export default signUp;
