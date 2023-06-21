const User = require("../modals/users/userModal");
const { compareAndHashPasswords, verifyMail, salting } = require("../utils");
const jwt = require("jsonwebtoken");

const API_BASEURL = process.env.API_BASEURL;
const API_BASENAME = process.env.API_BASENAME;
const API_BASEPATH = process.env.API_BASEPATH;

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
  let saltToken = salting();
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
    isEmailVerifiedToken: saltToken,
    // isEmailVerifiedToken: true,
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
      console.log("awaitnewUser.save ~ mailResponse: >>", mailResponse);
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
        console.log("awaitnewUser.save ~ mailResponse: >>", mailResponse);
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
    console.log("login ~ user: >>", user);
    const isMatch = await compareAndHashPasswords(password, user?.password);

    if (!user || !isMatch) {
      return { status: 401, message: "Invalid email or password!!!" };
    }

    const secretKey = process.env.SECRET_KEY;
    const token = jwt.sign({ userId: user._id, email: user.email }, secretKey, {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      // expiresIn: 60, // 60 sec
    });

    return { status: 200, message: "Login successfully", token };
  } catch (error) {
    console.log("login ~ error: >>", error);
    return { status: 500, message: "Internal server error" };
  }
};

const emailToken = async (body) => {
  try {
    let { email, token } = body;
    email = email?.toLowerCase();
    if (!email && !token) {
      return {
        status: 400,
        message: "Please click on correct link to verify your email",
      };
    }
    const user = await User.findOne({ email });

    if (!user) {
      return { status: 400, message: "Invalid token" };
    }
    if (user?.token === true) {
      return { status: 200, message: "Email already verifyed" };
    } else if (user.token === token) {
      return { status: 200, message: "Email verified sucessfully" };
    } else {
      return { status: 400, message: "Invalid Token" };
    }
  } catch (error) {
    console.log("login ~ error: >>", error);
    return { status: 500, message: "Internal server error" };
  }
};

module.exports = { login, registerUser, emailToken };
