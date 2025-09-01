// models/userModel.js
const users = [
  { username: "admin", password: "1234", role: "admin", disecode: "D001" },
  { username: "teacher", password: "abcd", role: "teacher", disecode: "D002" },
];

function findUser(username) {
  return users.find((u) => u.username === username);
}

module.exports = { findUser };
