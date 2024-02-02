import Transport from "../../config/nodemailer.js";
import env from "dotenv";
env.config();

const signIn= (name, email) => {
  console.log("Sign in email Function Called")
  let option = {
    from: process.env.EMAIL_SENDER,
    to: `${email}`,
    subject: " Logged Into Instagram",
    text: "Hey , it’s our first message sent with Nodemailer after login ",
    html: `<b>Hey ${name}! </b><br> This is our first message sent with Nodemailer after login <br />`,
  };

  Transport.sendMail(option, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: ", info);
  });
};

export default signIn;
