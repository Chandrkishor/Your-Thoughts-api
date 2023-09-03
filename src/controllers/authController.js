const jwt = require("jsonwebtoken");
const User = require("../modals/userModal");
const { jwtSecret } = require("../constant");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // * second way to authenticate
  // const token = req.cookies.access_Token;
  if (!token) {
    return next(new AppError("You are not logged in! Please log-in", 401));
  }

  const decodedToken = jwt.verify(token, jwtSecret);
  // this one to check if the user is not altered by someone\
  const CurrentUser = await User.findById(decodedToken?._id);
  if (!CurrentUser) {
    return next(
      new AppError("The user belongings to this token does not exist", 401),
    );
  }
  // this to check if the token is before password change or after
  if (CurrentUser.changePasswordAfter(decodedToken.iat)) {
    return next(new AppError("Password changed, Please login again", 401));
  }
  req.user = CurrentUser;
  next();
});

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
  protect,
  restrictTo,
};
