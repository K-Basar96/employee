const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const app = express();
const PORT = 5000; // you can change port if needed

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../dist")));

// Example route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Mount microservice route
app.use("/auth", authRoutes);

// Example API route
// app.post("/login", (req, res) => {
//     const { username, disecode, password, role } = req.body;
//     // let's call our model
//     // Dummy validation
//     if (username === "admin" && password === "1234") {
//         res.json({ success: true, message: "Login successful!" });
//     } else {
//         res.status(401).json({ success: false, message: "Invalid credentials" });
//     }
// });

app.get("/captcha", (req, res) => {
    const captcha = Math.floor(100000 + Math.random() * 900000); // random 6 digit
    res.json({ captcha });
});

// No route On the server(e.g: /dashboard), React Router routes work
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`Auth service running on http://localhost:${PORT}`);
});
