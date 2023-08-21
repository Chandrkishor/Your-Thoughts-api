const { UI_BASEURL, API_BASEPATH, API_BASENAME } = require("../constant");
const CreateUser = require("../services/LoginSrv");
const { emailToken } = require("./authController");
const crypto = require("crypto");

const registerUser = async (req, res) => {
  const {
    email,
    name,
    password,
    confirmPassword,
    role = undefined,
  } = req.body ?? {};
  const user = {
    name,
    email,
    password,
    confirmPassword,
    role,
  };

  try {
    if (!name || !email || !password || !confirmPassword) {
      const error = new Error("Please fill all the required fields");
      error.status = 400; // 400 Bad Request for missing input
      throw error;
    }
    const baseUrl = `${req.protocol}://${req.get(
      "host",
    )}/${API_BASENAME}${API_BASEPATH}verify`;
    // Sending to service to register user
    const createUser = await CreateUser.registerUser(user, baseUrl);
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
    const baseUrl = `${req.protocol}://${req.get(
      "host",
    )}/${API_BASENAME}${API_BASEPATH}verify`;
    const body = { email, password };
    const userLogin = await CreateUser.login(body, baseUrl);
    // await res.cookie("access_Token", userLogin.token, {
    //   secure: false, // Set to true for production with HTTPS
    //   withCredentials: true,
    //   httpOnly: false,
    //   sameSite: "Lax",
    //   maxAge: jwtExpire,
    // });

    res.status(userLogin?.status).json({
      message: userLogin?.message,
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
  const tokenResponse = await emailToken(params);

  if (tokenResponse?.status === 200) {
    res.redirect(`${UI_BASEURL}login`);
  } else {
    res
      .status(tokenResponse?.status ?? 200)
      .json({ message: tokenResponse?.message ?? "" });
  }
};

const forgot = async (req, res) => {
  const email = req.body?.email;
  try {
    const baseUrl = `${req.protocol}://${req.get(
      "host",
    )}/${API_BASENAME}${API_BASEPATH}`;
    const forgotPass = await CreateUser.forgotPassword(email, baseUrl);

    res.status(forgotPass?.status).json({
      message: forgotPass?.message,
      resetToken: forgotPass.resetToken,
    });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

const reset = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await CreateUser.resetPassword(hashedToken, req.body);
    res.status(user?.status).json({
      message: user?.message,
      token: user.token ?? null,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};
const updatePassword = async (req, res) => {
  try {
    await CreateUser.updatePass(req.body);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  updatePassword,
  registerUser,
  verifyEmail,
  userLogin,
  forgot,
  reset,
};
