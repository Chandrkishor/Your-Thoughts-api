const {
  UI_BASEURL,
  API_BASEPATH,
  API_BASENAME,
  EMAIL_VERIFY_SUB,
  EMAIL_RESET_SUB,
  jwtSecret,
} = require("../constant");
const jwt = require("jsonwebtoken");
const User = require("../modals/userModal");
const { verifyMail } = require("../utils");
const { emailToken } = require("./authController");
const crypto = require("crypto");

const createSendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id }, jwtSecret);
  res.status(statusCode).json({
    message: "internal server error",
    token,
    data: { user },
  });
};

const registerUser = async (req, res) => {
  const {
    email,
    name,
    password,
    confirmPassword,
    role = undefined,
  } = req.body ?? {};
  const user = {
    name,
    email,
    password,
    confirmPassword,
    role,
  };

  try {
    if (!name || !email || !password || !confirmPassword) {
      const error = new Error("Please fill all the required fields");
      error.status = 400; // 400 Bad Request for missing input
      throw error;
    }
    const baseUrl = `${req.protocol}://${req.get(
      "host",
    )}/${API_BASENAME}${API_BASEPATH}verify`;

    // Check if the email address already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      const error = new Error("The email address already exists.");
      error.status = 409; // 409 Conflict seems more appropriate for duplicate resources
      throw error;
    }
    // Create a new user
    let newUser = await User.create(user);
    // generating token for user
    const verificationToken = newUser.generateAuthToken();
    // Send verification email
    try {
      const verificationUrl = `${baseUrl}/${verificationToken}`;
      const message = `Please verify your email by clicking the link below:\n${verificationUrl}\nIf you have already done this, please ignore this email.\nThank you - Your Thoughts`;

      await verifyMail({
        email,
        subject: EMAIL_VERIFY_SUB,
        message,
      });
      res.status(201).json({
        message: `User created successfully! Check your email at: ${email}.`,
        token: verificationToken,
      });
      // createSendToken(newUser, 201, res);
    } catch (error) {
      res.status(500).json({
        message:
          "There was an error sending the email. Please try again later.",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      const error = new Error("Please provide a valid email and password");
      error.status = 400; // 400 Bad Request for missing input
      throw error;
    }
    const baseUrl = `${req.protocol}://${req.get(
      "host",
    )}/${API_BASENAME}${API_BASEPATH}verify`;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.isCorrectPassword(password, user.password))) {
      return res.status(401).json({
        message: `Invalid email or password!!!`,
      });
    }
    const verificationToken = user.generateAuthToken();
    if (!user.isEmailVerified) {
      try {
        const verificationUrl = `${baseUrl}/${verificationToken}`;
        const message = `Please verify your email by clicking the link below:\n${verificationUrl}\nIf you have already done this, please ignore this email.\nThank you - Your Thoughts`;

        await verifyMail({
          email,
          subject: EMAIL_VERIFY_SUB,
          message,
        });

        return res.status(201).json({
          message: `User created successfully! Check your email at: ${email}.`,
          token: verificationToken,
        });
      } catch (error) {
        console.log(`error--: >>`, error);

        return res.status(500).json({
          message: "internal server error",
          token: "",
        });
      }
    }

    return res.status(200).json({
      message: "Login successfully",
      token: verificationToken,
    });

    // await res.cookie("access_Token", userLogin.token, {
    //   secure: false, // Set to true for production with HTTPS
    //   withCredentials: true,
    //   httpOnly: false,
    //   sameSite: "Lax",
    //   maxAge: jwtExpire,
    // });
  } catch (error) {
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
};

const verifyEmail = async (req, res) => {
  let params = req?.params?.link;
  if (!req?.params.link?.length) {
    res.status(400).json({ message: "Invalid token" });
  }
  const tokenResponse = await emailToken(params);

  if (tokenResponse?.status === 200) {
    // res.status(200).redirect(`${UI_BASEURL}login`);
    res.status(200).json({
      website: `${UI_BASEURL}login`,
      msg: "Email Verified Successfully",
    });
  } else {
    res
      .status(tokenResponse?.status ?? 200)
      .json({ message: tokenResponse?.message ?? "" });
  }
};

const forgot = async (req, res) => {
  try {
    const email = req.body?.email;
    const baseUrl = `${req.protocol}://${req.get(
      "host",
    )}/${API_BASENAME}${API_BASEPATH}`;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        message: "There is no user with this email address.",
      });
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // validate before save false make stop all the validation errors, likes required fields and all
    try {
      // sent it to user email
      const resetURL = `${baseUrl}reset_password/${resetToken}`;
      const message = `Forgot your password? Submit a patch request to reset your password with a new password and confirm-password at: ${resetURL}.\nIf you did not forget your password, please ignore this email.`;
      await verifyMail({
        email,
        subject: EMAIL_RESET_SUB,
        message,
      });
      res.status(200).json({
        message: `Reset token send to ${email}.`,
        resetToken: resetToken,
      });
    } catch (errors) {
      console.log(`<< :--  errors--: >>`, errors);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({
        message:
          "There was an error, sending the email. Please try again later",
      });
    }
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal Sever Error" });
  }
};

const reset = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token!",
      });
    }

    user.password = password;
    user.confirmPassword = confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    const token = user.generateAuthToken();
    return res.status(200).json({
      message: `Password updated successfully`,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error,
    });
  }
};

const updatePassword = async (req, res, next) => {
  try {
    // 1)  get the user from the collection
    const user = await User.findById(req.user.id).select("+password");
    // 2) if posted current password is correct
    if (
      !(await user.isCorrectPassword(req.body.currentPassword, user.password))
    ) {
      return res.status(401).json({
        message: "current password is incorrect",
      });
    }
    // 3) if so update the password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save(); // user.findByIdAndUpdate will not work as intended
    // 4) log user in send JWT
    const verificationToken = user.generateAuthToken();
    return res.status(200).json({
      verificationToken,
      message: "password Re-sets successfully",
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Something went wrong",
    });
  }
};

module.exports = {
  updatePassword,
  registerUser,
  verifyEmail,
  userLogin,
  forgot,
  reset,
};
