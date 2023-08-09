const CreateUser = require("../services/LoginSrv");

const registerUser = async (req, res) => {
  const { email, name, password, confirmPassword } = req.body ?? {};
  const user = {
    name,
    email,
    password,
    confirmPassword,
  };

  try {
    if (!name || !email || !password || !confirmPassword) {
      const error = new Error("Please fill all the required fields");
      error.status = 400; // 400 Bad Request for missing input
      throw error;
    }
    // Sending to service to register user
    const createUser = await CreateUser.registerUser(user);
    res.status(createUser?.status).json({
      message: createUser?.message,
      token: createUser?.verificationToken,
    });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      const error = new Error("Please provide a valid email and password");
      error.status = 400; // 400 Bad Request for missing input
      throw error;
    }
    const body = { email, password };
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
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
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
