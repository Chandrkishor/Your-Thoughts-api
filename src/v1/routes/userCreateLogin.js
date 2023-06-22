const express = require("express");
const UserCreateAndLogin = require("../../controllers/CreateAndLogin");

const router = express.Router();

// router.get("/:userId", UserCreateAndLogin.getOneUser);
router.get("/verify/:link", UserCreateAndLogin.verifyEmail);
router.post("/register", UserCreateAndLogin.registerUser);
router.post("/login", UserCreateAndLogin.userLogin);
// router.patch("/:userId", UserCreateAndLogin.updateOneUser);
// router.patch("reset/:userId", UserCreateAndLogin.updateOneUserPassword);
// router.delete("/:userId", UserCreateAndLogin.deleteOneUserDetail);

module.exports = router;
