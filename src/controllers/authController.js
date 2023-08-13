const jwt = require("jsonwebtoken");
const User = require("../modals/userModal");
const { jwtSecret } = require("../constant");

const verifyToken = async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // * second way to authenticate
    // const token = req.cookies.access_Token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "You are not logged in! Please log-in" });
    }

    const decodedToken = jwt.verify(token, jwtSecret);
    // this one to check if the user is not altered by someone\
    const CurrentUser = await User.findById(decodedToken?._id);
    if (!CurrentUser) {
      return res
        .status(401)
        .json({ message: "The user belongings to this token does not exist" });
    }
    // this to check if the token is before password change or after
    if (CurrentUser.changePasswordAfter(decodedToken.iat)) {
      return res
        .status(401)
        .json({ message: "Password changed, Please login again" });
    }
    req.user = CurrentUser;
    next();
  } catch (error) {
    console.log(`error--: >>`, error);
    return res
      .status(error.status || 500)
      .json({ message: error.message ?? "something went wrong" });
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

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ["admin", "manager", ]
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to access this." });
    }
    next();
  };
};

module.exports = {
  emailToken,
  verifyToken,
  restrictTo,
};
