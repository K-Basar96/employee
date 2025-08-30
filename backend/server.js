const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000; // you can change port if needed

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Example route
app.get("/", (req, res) => {
    res.send("Hello from Node.js backend 🚀");
});

// Example API route
app.post("/login", (req, res) => {
    const { username, disecode, password, role } = req.body;

    // Dummy validation
    if (username === "admin" && password === "1234") {
        res.json({ success: true, message: "Login successful!" });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

app.get("/captcha", (req, res) => {
    const captcha = Math.floor(100000 + Math.random() * 900000); // random 6 digit
    res.json({ captcha });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
