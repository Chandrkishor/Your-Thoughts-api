const { API_BASEURL, API_BASENAME, API_BASEPATH } = require("../constant");
const User = require("../modals/userModal");
const { verifyMail } = require("../utils");

const registerUser = async (body) => {
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
    await verifyMail(
      email,
      name,
      `${API_BASEURL}${API_BASENAME}${API_BASEPATH}verify/${verificationToken}`,
    );
    return {
      status: 201,
      verificationToken,
      message: `User created successfully! Check your email at: ${email}.`,
    };
  } catch (errors) {
    const error = new Error(errors?.message);
    error.status = 500;
    throw error;
  }
};

const login = async (body) => {
  try {
    let { email, password } = body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.isCorrectPassword(password, user.password))) {
      return { status: 401, message: "Invalid email or password!!!" };
    }

    const token = user.generateAuthToken();
    if (!user.isEmailVerified) {
      await verifyMail(
        email,
        user?.name,
        `${API_BASEURL}${API_BASENAME}${API_BASEPATH}verify/${token}`,
      );
      return {
        status: 403,
        message: `Check your email and verify: ${user.email}`,
      };
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

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return {
      status: 404,
      message: "There is no user with this email address.",
    };
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // validate before save false make stop all the validation errors, likes required fields and all

  await verifyMail(
    email,
    "",
    `${API_BASEURL}${API_BASENAME}${API_BASEPATH}reset_password/${resetToken}`,
  );
  return {
    status: 200,
    message: `Reset token send successfully`,
    resetToken,
  };
};

const resetPassword = (req, res, next) => {};

module.exports = { login, registerUser, forgotPassword, resetPassword };
