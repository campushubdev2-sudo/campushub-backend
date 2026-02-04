import nodemailer from "nodemailer";

import { EMAIL_PASSWORD, EMAIL_SERVICE, EMAIL_USER } from "../config/env.js";
import { AppError } from "../middlewares/error.middleware.js";

if (!EMAIL_SERVICE || !EMAIL_USER || !EMAIL_PASSWORD) {
  throw new Error("Missing EMAIL_SERVICE, EMAIL_USER, or EMAIL_PASSWORD");
}

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });
  }

  async sendOTPEmail(email, otpCode) {
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Your OTP Verification Code",
      text: `Your OTP is: ${otpCode}`,
      html: `<b>Your OTP is: <span style="font-size: 1.2em; color: #2c3e50;">${otpCode}</span></b>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      // Log the actual error for debugging, but don't show it to the user
      console.error("Email Service Error:", error);

      throw new AppError(
        "We couldn't send your OTP. Please try again in a moment.",
        500,
      );
    }
  }
}

export default new EmailService();
