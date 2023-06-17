const CreateUser = require("../services/createAndLogin");

const isAdmin = (req) => {
  // Get the user from the request headers
  const user = req.headers.user;

  //? Check if the user is an administrator return true or false
  if (user && user.isAdmin) {
    return true;
  } else {
    return false;
  }
};

const registerUser = async (req, res) => {
  let body = req.body;
  //? Check if the user is an administrator
  const isAccess = isAdmin(req);
  // Create a new user object
  const user = {
    ...body,
    isAdminAccess: isAccess,
  };

  // Save the user object to the database
  const createUser = await CreateUser.registerUser(user);
  // Return a success response
  res
    .status(createUser?.status || 400)
    .json(createUser?.message || "Something went wrong!!!");
};
const userLogin = async (req, res) => {
  let body = req.body;
  console.log("login ~ body: >>", body);
  res.status(200).json({ data: "login hit" });
};

module.exports = { registerUser, userLogin };
