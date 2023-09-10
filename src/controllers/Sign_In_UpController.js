const {
  UI_BASEURL,
  API_BASEPATH,
  API_BASENAME,
  EMAIL_VERIFY_SUB,
  EMAIL_RESET_SUB,
  jwtSecret,
} = require("../constant");
const jwt = require("jsonwebtoken");
const User = require("../modals/userModal");
const { verifyMail, filterObjKey, isValidObjKeyVal } = require("../utils");
const { emailToken } = require("./authController");
const crypto = require("crypto");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const createSendToken = (res, statusCode, withToken = false, user) => {
  const response = {
    status: "success",
    data: user ?? {},
  };

  if (withToken) {
    const token = jwt.sign({ id: user.id }, jwtSecret);
    response.token = token;
  }

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
  const baseUrl = `${req.protocol}://${req.get(
    "host",
  )}/${API_BASENAME}${API_BASEPATH}verify`;

  // Check if the email address already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    next(new AppError(`The email address already exists`, 409));
  }
  // Create a new user
  let newUser = await User.create(userData);
  // generating token for user
  const verificationToken = newUser.generateAuthToken();
  // Send verification email
  const { email } = userData;
  const verificationUrl = `${baseUrl}/${verificationToken}`;
  const message = `Please verify your email by clicking the link below:\n${verificationUrl}\nIf you have already done this, please ignore this email.\nThank you - Your Thoughts`;

  await verifyMail({
    email,
    subject: EMAIL_VERIFY_SUB,
    message,
  }).catch((err) => {
    // don't  want to throw an error just because user is already created
    console.log(`<< :--  err--: >>`, err);
  });
  res.status(201).json({
    message: `User created successfully! Check your email at: ${email}.`,
    token: verificationToken,
  });
});

const userLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide a valid email and password", 400));
  }
  const baseUrl = `${req.protocol}://${req.get(
    "host",
  )}/${API_BASENAME}${API_BASEPATH}verify`;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new AppError("Invalid email or password!!!", 401));
  }
  const verificationToken = user.generateAuthToken();
  if (!user.isEmailVerified) {
    const verificationUrl = `${baseUrl}/${verificationToken}`;
    const message = `Please verify your email by clicking the link below:\n${verificationUrl}\nIf you have already done this, please ignore this email.\nThank you - Your Thoughts`;

    await verifyMail({
      email,
      subject: EMAIL_VERIFY_SUB,
      message,
    })
      .then(() =>
        next(new AppError(`Please Verify your email : ${email}.`, 401)),
      )
      .catch(() =>
        next(
          new AppError(
            `Unable to send verification email to ${email}. Please try again.`,
            401,
          ),
        ),
      );
  }
  return res.status(200).json({
    message: "Login successfully",
    token: verificationToken,
    data: { _id: user._id, email: user.email, name: user.name },
  });
});

const verifyEmail = catchAsync(async (req, res, next) => {
  let params = req?.params?.link;
  if (!req?.params.link?.length) {
    return next(new AppError("Invalid token", 400));
  }
  emailToken(params, res, next);
  // res.status(200).redirect(`${UI_BASEURL}login`);
  // res.status(200).json({
  //   website: `${UI_BASEURL}login`,
  //   msg: "Email Verified Successfully",
  // });
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
  const resetURL = `${baseUrl}reset_password/${resetToken}`;
  const message = `Forgot your password? Submit a patch request to reset your password with a new password and confirm-password at: ${resetURL}.\nIf you did not forget your password, please ignore this email.`;
  verifyMail({
    email,
    subject: EMAIL_RESET_SUB,
    message,
  })
    .then(() =>
      res.status(200).json({
        message: `Reset token send to ${email}.`,
        resetToken: resetToken,
      }),
    )
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
  return res.status(200).json({
    message: "password Re-sets successfully",
    token,
  });
});

module.exports = {
  updatePassword,
  singUp,
  verifyEmail,
  userLogin,
  forgot,
  reset,
};
