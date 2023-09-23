const {
  API_BASEPATH,
  API_BASENAME,
  jwtSecret,
  cookieExpire,
  NODE_ENV,
} = require("../constant");
const jwt = require("jsonwebtoken");
const User = require("../modals/userModal");
const { sendVerifyMail, filterObjKey, isValidObjKeyVal } = require("../utils");
const { emailToken } = require("./authController");
const crypto = require("crypto");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const createSendToken = async (res, statusCode, user, isSendUser = true) => {
  const filteredObj = filterObjKey({ ...user._doc }, "name", "email", "_id");
  const token = jwt.sign({ _id: user._id }, jwtSecret);

  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
    secure: NODE_ENV === "development" ? false : true,
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  const response = {
    status: "success",
    token: token,
    data: isSendUser ? filteredObj ?? {} : null,
  };
  return res.status(statusCode).json(response);
};

const singUp = catchAsync(async (req, res, next) => {
  let userData = filterObjKey(
    req.body,
    "name",
    "email",
    "password",
    "confirmPassword",
  );

  if (
    !isValidObjKeyVal(userData, "name", "email", "password", "confirmPassword")
      ?.valid
  ) {
    next(new AppError(`Please fill all the required fields`, 400));
  }

  // Check if the email address already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    next(new AppError(`The email address already exists`, 409));
  }
  // Create a new user
  let newUser = await User.create(userData);
  createSendToken(res, 201, newUser);
});

const userLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide a valid email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new AppError("Invalid email or password!!!", 401));
  }
  return createSendToken(res, 200, user);
});

const verifyEmail = catchAsync(async (req, res, next) => {
  let params = req?.params?.link;
  if (!req?.params.link?.length) {
    return next(new AppError("Invalid token", 400));
  }
  return emailToken(params, res, next);
});

const forgot = catchAsync(async (req, res, next) => {
  const email = req.body?.email;

  const baseUrl = `${req.protocol}://${req.get(
    "host",
  )}/${API_BASENAME}${API_BASEPATH}`;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError(`There is no user with this email address.`, 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // validate before save false make stop all the validation errors, likes required fields and all

  // sent it to user a email with reset token and save into database after hashing, if email failed the remove token for db and return filed msg to user
  sendVerifyMail({
    email,
    type: "resetToken",
    baseUrl,
    token: resetToken,
  })
    .then(() => createSendToken(res, 200, user, false))
    .catch(async () => {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          `There was an error, sending the email. Please try again later`,
          500,
        ),
      );
    });
});

const reset = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError(`Invalid or expired token!`, 400));
  }

  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  const token = user.generateAuthToken();
  return res.status(200).json({
    message: `Password updated successfully`,
    token,
  });
});

const updatePassword = catchAsync(async (req, res, next) => {
  // 1)  get the user from the collection
  const { id: userId } = req.user;
  const user = await User.findById(userId).select("+password");
  // 2) if posted current password is correct
  if (
    !(await user.isCorrectPassword(req.body.currentPassword, user.password))
  ) {
    return next(new AppError(`current password is incorrect`, 401));
  }
  // 3) if so update the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save(); // user.findByIdAndUpdate will not work as intended
  // 4) log user in send JWT
  const token = user.generateAuthToken();
  return createSendToken(res, 200, user, false);
});

module.exports = {
  updatePassword,
  singUp,
  verifyEmail,
  userLogin,
  forgot,
  reset,
};
