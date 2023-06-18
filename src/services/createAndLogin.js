const User = require("../modals/users/userModal");
const { compareAndHashPasswords } = require("../utils");
const jwt = require("jsonwebtoken");

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
    isAdminAccess = false,
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

  //? 1. create() is a shortcut for creating new documents in the database.
  //? 2.  save() is used for both creating new documents and updating existing ones, with additional options available for customization.
  // Create a new user
  const newUser = new User({
    name,
    email,
    password: hashPassword,
    age,
    gender,
    contact,
    image,
    imageType,
    imageSize,
    isAdmin: false,
  });

  //? The user is an administrator, so save without checking isAdmin permission true or false
  if (isAdminAccess) {
    await newUser.save();
  } else {
    if (newUser.isAdmin) {
      return { status: 401, message: "Unauthorized!!!" };
    } else await newUser.save();
  }
  // Return a success response
  return {
    status: 201,
    message: `User created successfully.`,
  };
};

const login = async (body) => {
  try {
    let { email, password } = body;
    email = email?.toLowerCase();
    if (!email || !password) {
      return {
        status: 400,
        message: "Email and password are required fields!!!",
      };
    }
    const user = await User.findOne({ email });
    // console.log("login ~ user: >>", user);

    if (!user) {
      return { status: 404, message: "User not found!!!" };
    }

    const isMatch = await compareAndHashPasswords(password, user?.password);

    if (!isMatch) {
      return { status: 401, message: "Invalid email or password!!!" };
    }
    const secretKey = process.env.SECRET_KEY;
    const token = jwt.sign({ userId: user._id, email: user.email }, secretKey);

    return { status: 200, message: "Login successfully", token };
  } catch (error) {
    console.log("login ~ error: >>", error);
    return { status: 500, message: "Internal server error" };
  }
};

module.exports = { login, registerUser };
