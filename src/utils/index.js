const sharp = require("sharp");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

//! Function to convert HEIC to JPEG
//? how to use above function to convert
// const jpegBuffer = await convertHeicToJpeg(heicBuffer);
async function convertHeicToJpeg(heicBuffer) {
  try {
    const jpegBuffer = await sharp(heicBuffer).jpeg().toBuffer();

    return jpegBuffer;
  } catch (error) {
    console.error("Error converting HEIC to JPEG:", error);
    throw error;
  }
}

//!
// const isMatch = await bcrypt.compare(password, hashPassword);
// const salt = crypto.randomBytes(16).toString("hex");
async function salting() {
  try {
    const salt = await crypto.randomBytes(16).toString("hex");
    return salt;
  } catch (error) {
    console.error("Salting failed:", error);
    throw error;
  }
}

async function compareAndHashPasswords(password, passwordHash, type = null) {
  try {
    if (type === "hashPassword") {
      const salt = await salting();
      //? bcrypt.hashSync()	Hashes the password immediately and returns the hash.	where bcrypt.hash() Hashes the password asynchronously and returns a promise.
      const hashPassword = await bcrypt.hashSync(password, 12, salt);
      return hashPassword;
    } else {
      const match = await bcrypt.compare(password, passwordHash);
      return match;
    }
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error;
    // return false;
  }
}

const verifyToken = async (req, res, next) => {
  const secretKey = process.env.SECRET_KEY;
  const authHeader = req?.headers?.authorization;
  token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }

  try {
    const decodedToken = await jwt.verify(token, secretKey);
    const remainingTime = decodedToken.exp * 1000 - Date.now();

    // Token has expired
    if (remainingTime < 0) {
      // res.redirect("/login");
      return res.status(401).json({ message: "Token expired" });
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyMail = async (email, name, vlink = "no LINK FOR NOW") => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EPASS,
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
      from: process.env.EMAIL,
      to: email,
      subject: "Email verification for Binary bits",
      text: "That was easy!",
      html: template
        .replace("{{verification_link}}", vlink)
        .replace("{{name}}", name),
    };
    let sendReciept = await transporter.sendMail(mailDetails);
    return {
      status: 200,
      message: `email has been sent for account verification `,
      data: sendReciept,
    };
  } catch (error) {
    return { status: 400, message: "Error sending email!!! " };
  }
};

module.exports = {
  convertHeicToJpeg,
  compareAndHashPasswords,
  verifyToken,
  verifyMail,
};
