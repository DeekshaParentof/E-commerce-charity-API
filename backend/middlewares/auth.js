const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/userSchema");
const jwt_key = process.env.JWT_SECRETE_KEY;

async function authenticateUser(req, res, next) {
    const header = req.headers["authorization"] || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({
            status: "Failed",
            message: "Unauthorized user"
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, jwt_key);
    } catch (err) {
        return res.status(401).json({
            status: "Failed",
            message: err.name === "TokenExpiredError" ? "Session expired, please login again" : "Invalid token"
        });
    }

    try {
        const user = await User.findById(decoded.user_id).select("-password");

        if (!user) {
            return res.status(401).json({
                status: "Failed",
                message: "User not found"
            });
        }
        req.user = user;
        req.user_id = user._id;

        next();
    } catch (err) {
        return res.status(500).json({
            status: "Failed",
            message: "Authentication failed"
        });
    }
}

module.exports = { authenticateUser };
