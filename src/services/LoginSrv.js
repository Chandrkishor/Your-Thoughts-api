const {
  API_BASEURL,
  API_BASENAME,
  API_BASEPATH,
  jwtSecret,
  jwtExpire,
} = require("../constant");
const User = require("../modals/userModal");
const { compareAndHashPasswords, verifyMail, salting } = require("../utils");
const jwt = require("jsonwebtoken");

const registerUser = async (body) => {
  const { name, email } = body; // Destructure directly in the parameter list
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
    console.log("registerUser ~-------- newUser: >>", newUser);

    // Generate a verification token
    const verificationToken = jwt.sign({ _id: newUser._id }, jwtSecret, {
      expiresIn: jwtExpire,
    });

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

  return {
    status: 201,
    message: `User created successfully! Check your email at: ${email}.`,
  };
};

const login = async (body) => {
  try {
    let { email, password } = body;
    const user = await User.findOne({ email }).select("+password");
    console.log("login ~--------> user: >>", user);
    const isMatch = await compareAndHashPasswords(password, user?.password);

    if (!user || !isMatch) {
      return { status: 401, message: "Invalid email or password!!!" };
    }
    let userDetails = {
      _id: user._id,
      email: user.email,
      name: user.name,
      contact: user.contact,
      isAdmin: user.isAdmin,
      isEmailVerifiedToken: user.isEmailVerifiedToken,
    };

    const token = jwt.sign({ userId: user._id, email: user.email }, secretKey, {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      // expiresIn: 60, // 60 sec
    });

    return { status: 200, message: "Login successfully", token, userDetails };
  } catch (error) {
    console.log("login ~ error: >>", error);
    return { status: 500, message: "Internal server error" };
  }
};

const emailToken = async (body) => {
  try {
    const decoded = jwt.verify(body, secretKey);
    const email = decoded?.email;
    if (!email) {
      return {
        status: 400,
        message: "Invalid Token",
      };
    }
    const user = await User.findOne({ email });
    if (!user) {
      return { status: 400, message: "Invalid token" };
    }
    if (user?.isEmailVerifiedToken === true) {
      return {
        status: 200,
        message: "Email already verified",
        website: `${UI_BASEURL}login`,
      };
    } else if (email?.length) {
      await user.updateOne({ isEmailVerifiedToken: true });
      return {
        status: 200,
        message: "Email verified successfully",
        website: `${UI_BASEURL}login`,
      };
      // res.redirect(`${UI_BASEURL}login`);
    } else {
      return { status: 400, message: "Invalid Token" };
    }
  } catch (error) {
    console.log("login ~ error: >>", error);
    return { status: 500, message: "Internal server error" };
  }
};

module.exports = { login, registerUser, emailToken };
