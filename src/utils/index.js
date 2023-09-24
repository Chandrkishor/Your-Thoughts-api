const sharp = require("sharp");
const nodemailer = require("nodemailer");
const {
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_RESET_SUB,
} = require("../constant");

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

const getSubAndMsg = (opts) => {
  const resetURL = `${opts?.baseUrl}reset_password/${opts.token}`;

  if (opts?.type === "resetToken")
    return {
      message: `Forgot your password? Submit a patch request to reset your password with a new password and confirm-password at: ${resetURL}.\nIf you did not forget your password, please ignore this email.\nThank you - Your Thoughts`,
      subject: EMAIL_RESET_SUB,
    };
  else if (opts?.type === "verifyEmail") {
    return {
      message: `Please verify your email by clicking the link below:\n${opts.baseUrl}/${opts.token}\nIf you have already done this, please ignore this email.\nThank you - Your Thoughts`,
      subject: "Verify your email!!!",
    };
  }
};

const sendVerifyMail = async (options) => {
  let transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  let SubAndMsg = getSubAndMsg(options);

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
    to: options.email,
    subject: SubAndMsg.subject,
    text: SubAndMsg.message,
  };
  let sendReceipt = await transporter.sendMail(mailDetails);
  return {
    status: 200,
    data: sendReceipt,
  };
};

function isValidObjKeyVal(obj, ...keys) {
  let result = {
    exists: true,
    valid: true,
    message: "",
  };

  for (const key of keys) {
    if (!(key in obj)) {
      result.exists = false;
      result.valid = false;
      result.message = `Please fill required details! ${key} is missing.`;
      break;
    }

    const value = obj[key];
    if (value === null || value === undefined || value === "") {
      result.valid = false;
      result.message = `${key} is not valid.`;
      break;
    }
  }

  return result;
}

const filterObjKey = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      if (el === "_id") {
        newObj[el] = obj[el].toString(); // Convert ObjectId to string
      } else {
        newObj[el] = obj[el];
      }
    }
  });
  return newObj;
};

module.exports = {
  convertHeicToJpeg,
  sendVerifyMail,
  isValidObjKeyVal,
  filterObjKey,
};
