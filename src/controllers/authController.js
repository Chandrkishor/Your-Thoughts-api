const jwt = require("jsonwebtoken");
const User = require("../modals/userModal");
const { jwtSecret, UI_BASEURL } = require("../constant");
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

const emailToken = catchAsync(async (body, res, next) => {
  const decoded = jwt.verify(body, jwtSecret);
  const _id = decoded?._id;
  if (!_id) {
    return next(new AppError("Invalid token", 400));
  }
  await User.updateOne({ _id }, { $set: { isEmailVerified: true } });
  res.status(200).json({
    website: `${UI_BASEURL}login`,
    msg: "Email Verified Successfully",
  });
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array just because spread operator will make it array ["admin", "manager", ]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to access this action.", 403),
      );
    }
    next();
  };
};

module.exports = {
  emailToken,
  protect,
  restrictTo,
};
