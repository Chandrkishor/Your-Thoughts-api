const User = require("../modals/users/userModal");
const { compareAndHashPasswords, verifyMail, salting } = require("../utils");
const jwt = require("jsonwebtoken");
require("dotenv").config();
//
const API_BASEURL = process.env.API_BASEURL;
const UI_BASEURL = process.env.UI_BASEURL;
// console.log("API_BASEURL: >>", API_BASEURL);
const API_BASENAME = process.env.API_BASENAME;
const API_BASEPATH = process.env.API_BASEPATH;
const secretKey = process.env.SECRET_KEY;

const registerUser = async (body) => {
  let {
    name,
    email,
    password,
    age,
    gender,
    contact,
    image,
    imageType,
    imageSize,
    isAdminAccess,
  } = body;
  email = email?.toLowerCase();
  gender = gender?.toLowerCase();

  //? field validation checkings";
  if (!name || !email || !password || !age || !gender) {
    return { status: 400, message: "Please enter all required fields." };
  }

  const hashPassword = await compareAndHashPasswords(
    password,
    null,
    "hashPassword",
  );

  // Check if the email address already exists
  const user = await User.findOne({ email: email });
  if (user) {
    return { status: 403, message: "The email address already exists." };
  }
  const saltToken = jwt.sign({ email: email }, secretKey, {
    expiresIn: 60 * 60 * 24, // 30 days
  });
  // Create a new user
  const newUser = new User({
    age,
    name,
    email,
    image,
    gender,
    contact,
    imageType,
    imageSize,
    isAdmin: false,
    password: hashPassword,
    isEmailVerifiedToken: false,
  });
  //? 1. create() is a shortcut for creating new documents in the database.
  //? 2.  save() is used for both creating new documents and updating existing ones, with additional options available for customization.
  //? The user is an administrator, so save without checking isAdmin permission true or false
  if (isAdminAccess) {
    await newUser.save().then(async () => {
      let mailResponse = await verifyMail(
        email,
        name,
        `${API_BASEURL}${API_BASENAME}${API_BASEPATH}verify/${saltToken}`,
      );
    });
  } else {
    if (newUser.isAdmin) {
      return { status: 401, message: "Unauthorized!!!" };
    } else
      await newUser.save().then(async () => {
        let mailResponse = await verifyMail(
          email,
          name,
          `${API_BASEURL}${API_BASENAME}${API_BASEPATH}verify/${saltToken}`,
        );
      });
  }
  // Return a success response
  return {
    status: 201,
    // message: `User created successfully.`,
    message: `created successfully!. Check your email: ${email}.`,
  };
};

const login = async (body) => {
  try {
    let { email, password } = body;
    email = email?.toLowerCase();
    if (!email && !password) {
      return {
        status: 400,
        message: "Email and password are required fields!!!",
      };
    }
    const user = await User.findOne({ email });
    const isMatch = await compareAndHashPasswords(password, user?.password);

    if (!user || !isMatch) {
      return { status: 401, message: "Invalid email or password!!!" };
    }
    let userDetails = {
      _id: user._id,
      email: user.email,
      name: user.name,
      age: user.age,
      gender: user.gender,
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
