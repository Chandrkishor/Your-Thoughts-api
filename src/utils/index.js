const sharp = require("sharp");
const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../constant");

// Function to convert HEIC to JPEG
async function convertHeicToJpeg(heicBuffer) {
  try {
    const jpegBuffer = await sharp(heicBuffer).jpeg().toBuffer();
    return jpegBuffer;
  } catch (error) {
    console.error("Error converting HEIC to JPEG:", error);
    return error.message;
  }
}

const verifyMail = async (email, name, vlink = "null") => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
    let template = `<html>
                        <head>
                        <meta charset="UTF-8">
                        <title>Email Verification</title>
                        </head>
                        <body>
                        <div style="text-align: center;">
                            <h2>Email Verification</h2>
                            <p>Hello, {{name}}!</p>
                            <p>Thank you for registering! Please click the link below to verify your email address:</p>
                            <p>
                            <a href="{{verification_link}}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none;">Verify Email</a>
                            </p>
                            <p>If you didn't sign up for this account, you can safely ignore this email.</p>
                        </div>
                        </body>
                        </html>`;

    let mailDetails = {
      from: EMAIL_USER,
      to: email,
      subject: "Your Thoughts email verification",
      text: "That was easy!",
      html: template
        .replace("{{verification_link}}", vlink)
        .replace("{{name}}", name),
    };
    let sendReceipt = await transporter.sendMail(mailDetails);
    return {
      status: 200,
      message: `email has been sent for account verification `,
      data: sendReceipt,
    };
  } catch (error) {
    console.log("verifyMail ~ error: >>", error);
    return { status: 400, message: "Error sending email!!! " };
  }
};

module.exports = {
  convertHeicToJpeg,
  verifyMail,
};
