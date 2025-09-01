// controllers/authController.js
const { findUser } = require("../models/userModel");

function login(req, res) {
  const { username, disecode, password, role } = req.body;
  const user = findUser(username);

  if (user && user.password === password) {
    res.json({ success: true, message: "Login successful!", role: user.role });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
}

module.exports = { login };
