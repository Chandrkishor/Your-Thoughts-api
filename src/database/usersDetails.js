// In src/database/Workout.js
const DB = require("./db.json");

const getAllUsers = () => {
  return DB.usersDetails;
};

const getUsersById = (id) => {
  return DB.usersDetails.find((user) => user.id === Number(id));
};

module.exports = { getAllUsers, getUsersById };
