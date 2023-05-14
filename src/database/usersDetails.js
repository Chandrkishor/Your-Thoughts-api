// In src/database/Workout.js
const DB = require("./db.json");

const getAllUsers = () => {
  return DB.usersDetails;
};

module.exports = { getAllUsers };
