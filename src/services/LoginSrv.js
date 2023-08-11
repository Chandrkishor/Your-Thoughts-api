const {
  API_BASEURL,
  API_BASENAME,
  API_BASEPATH,
  UI_BASEURL,
  jwtSecret,
} = require("../constant");
const User = require("../modals/userModal");
const { verifyMail } = require("../utils");
const jwt = require("jsonwebtoken");

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

    if (!user.isEmailVerified) {
      const verificationToken = user.generateAuthToken();
      await verifyMail(
        email,
        user?.name,
        `${API_BASEURL}${API_BASENAME}${API_BASEPATH}verify/${verificationToken}`,
      );
      return {
        status: 403,
        message: `Check your email and verify: ${user.email}`,
      };
    }
    const token = user.generateAuthToken();
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

const emailToken = async (body) => {
  try {
    const decoded = jwt.verify(body, jwtSecret);
    const _id = decoded?._id;
    if (!_id) {
      return {
        status: 400,
        message: "Invalid Token",
      };
    }
    await User.updateOne({ _id }, { $set: { isEmailVerified: true } });

    return { status: 200 };
  } catch (error) {
    console.log("login ~ error: >>", error);
    return { status: 500, message: "Internal server error" };
  }
};

module.exports = { login, registerUser, emailToken };
