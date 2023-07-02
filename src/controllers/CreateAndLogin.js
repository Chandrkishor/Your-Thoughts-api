const CreateUser = require("../services/createAndLogin");

const isAdmin = (req) => {
  // Get the user from the request headers
  const user = req.headers.user;
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
  const userLogin = await CreateUser.login(body);

  await res.cookie("access_Token", userLogin.token, {
    secure: false,
    withCredentials: true,
    httpOnly: false,
    sameSite: "Lax",
  });

  res.status(userLogin?.status || 400).json({
    message: userLogin?.message || "Something went wrong!!!",
    user: userLogin?.userDetails || null,
    token: userLogin.token,
  });
};

const verifyEmail = async (req, res) => {
  let params = req?.params?.link;
  if (!req?.params.link?.length) {
    res.status(400).json({ message: "Invalid token" });
  }
  const tokenResponse = await CreateUser.emailToken(params);

  if (tokenResponse?.website) {
    res.redirect(tokenResponse.website);
  } else {
    res
      .status(tokenResponse?.status ?? 200)
      .json({ message: tokenResponse?.message ?? "" });
  }
};

module.exports = { registerUser, userLogin, verifyEmail };
