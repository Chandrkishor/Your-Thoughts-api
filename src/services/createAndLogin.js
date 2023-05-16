const CreateAndLogin = require("../modals/users/loginModal");

const registerUser = (body) => {
  CreateAndLogin.create(body)
    .then((createdUser) => {
      console.log("User created:", createdUser);
      return createdUser;
    })
    .catch((error) => {
      console.error("Error creating user:", error);
      return;
    });
};

const login = (body) => {
  CreateAndLogin.findById(body)
    .then((createdUser) => {
      console.log("User created:", createdUser);
      return createdUser;
    })
    .catch((error) => {
      console.error("Error creating user:", error);
      return;
    });
};

module.exports = { login, registerUser };
