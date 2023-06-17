const User = require("../modals/users/userModal");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

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

  //?bcrypt.hashSync()	Hashes the password immediately and returns the hash.	where bcrypt.hash() Hashes the password asynchronously and returns a promise.
  const salt = crypto.randomBytes(16).toString("hex");
  const hashPassword = bcrypt.hashSync(password, 12, salt);

  // Check if the email address already exists
  const user = await User.findOne({ email: email });
  if (user && hashPassword) {
    const isMatch = await bcrypt.compare(password, hashPassword);
    console.log("Password match", isMatch);
    return { status: 403, message: "The email address already exists." };
  }

  //?   1. create(): The create() method is a convenience method that automatically calls the new Model() method and then calls the save() method. This means that the create() method can only be used to create new documents in the database.
  //? 2. save(): The save() method can be used to create new documents in the database or to update existing documents in the database. The save() method allows you to specify additional options for the save operation, such as middleware to validate the user input before saving the user to the database.
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

const login = (body) => {
  User.findById(body)
    .then((createdUser) => {
      console.log("User created:", createdUser);
      return createdUser;
    })
    .catch((error) => {
      console.error("Error creating user:", error);
      return;
    });
};

module.exports = { login, registerUser };
