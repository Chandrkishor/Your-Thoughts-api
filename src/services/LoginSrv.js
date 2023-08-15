const {
  API_BASEURL,
  API_BASENAME,
  API_BASEPATH,
  EMAIL_RESET_SUB,
  EMAIL_VERIFY_SUB,
} = require("../constant");
const User = require("../modals/userModal");
const { verifyMail } = require("../utils");

const registerUser = async (body, baseUrl) => {
  const { name, email } = body;
  try {
    // Check if the email address already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      const error = new Error("The email address already exists.");
      error.status = 409; // 409 Conflict seems more appropriate for duplicate resources
      throw error;
    }
    // Create a new user
    let newUser = await User.create(body);
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
      return {
        status: 201,
        verificationToken,
        message: `User created successfully! Check your email at: ${email}.`,
      };
    } catch (error) {
      return {
        status: 500,
        message:
          "There was an error sending the email. Please try again later.",
      };
    }
  } catch (errors) {
    const error = new Error(errors?.message);
    error.status = 500;
    throw error;
  }
};

const login = async (body, baseUrl) => {
  try {
    let { email, password } = body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.isCorrectPassword(password, user.password))) {
      return { status: 401, message: "Invalid email or password!!!" };
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
        return {
          status: 201,
          verificationToken,
          message: `User created successfully! Check your email at: ${email}.`,
        };
      } catch (error) {
        console.log(`error--: >>`, error);
        return {
          status: 500,
          message:
            "There was an error sending the email. Please try again later.",
        };
      }
    }
    // const token = user.generateAuthToken();
    return {
      status: 200,
      message: "Login successfully",
      token,
    };
  } catch (error) {
    console.log("login ~ error: >>", error);
    return { status: 500, message: "Internal server error" };
  }
};

const forgotPassword = async (email, baseUrl) => {
  const user = await User.findOne({ email });
  if (!user) {
    return {
      status: 404,
      message: "There is no user with this email address.",
    };
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
    return {
      status: 200,
      message: `Reset token send to email !`,
      resetToken,
    };
  } catch (errors) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return {
      status: 500,
      message: "There was an error, sending the email. Please try again later",
    };
  }
};

const resetPassword = async (hashedToken, body) => {
  try {
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return { status: 400, message: "Invalid or expired token!" };
    }

    user.password = body.password;
    user.confirmPassword = body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    const token = user.generateAuthToken();
    return {
      status: 200,
      token,
      message: `Password updated successfully`,
    };
  } catch (error) {
    if (error.name === "ValidationError") {
      let msg;
      if (error.errors) {
        for (const field in error.errors) {
          //  console.error(`- ${field}: ${error.errors[field].message}`);
          msg = `${error.errors[field].message}`;
        }
      }
      return { status: 400, message: msg ?? error.message };
    }
    return { status: 500, message: "Internal server error" };
  }
};

module.exports = { login, registerUser, forgotPassword, resetPassword };
