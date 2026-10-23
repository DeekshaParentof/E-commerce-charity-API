const User = require("../models/userSchema")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const jwt_key = process.env.JWT_SECRETE_KEY
const jwt_expiry = process.env.JWT_EXPIRES_IN || "1d"

async function register(req, res) {
    try {
        const { name, email, mobile, password } = req.body;

        let existing_user = await User.findOne({ $or: [{ email }, { mobile }] });

        if (existing_user) {
            return res.status(400).json({
                status: "failed",
                message: "User with this email or mobile already exists"
            });
        }

        const hash = await bcrypt.hash(password, 10);

        // Public registration always creates a regular user.
        // Admin / super_admin accounts are created via the seed script or directly in the DB.
        let data = await User.create({
            name,
            email,
            mobile,
            password: hash,
            role: "user"
        });

        const user = data.toObject();
        delete user.password;

        return res.status(201).json({
            status: "success",
            message: "Registered successfully!!!",
            data: {
                user
            }
        });
    } catch (err) {
        res.status(500).json({
            status: "Failed",
            message: err.message
        });
    }
}

async function login(req, res) {
    try {
        const { userId, password } = req.body;
        const user = await User.findOne({ $or: [{ email: userId }, { mobile: userId }] });

        if (!user) {
            return res.status(404).json({
                status: "failed",
                message: "User not found"
            });
        }

        const result = await bcrypt.compare(password, user.password);
        if (!result) {
            return res.status(401).json({
                status: "failed",
                message: "Invalid password"
            });
        }

        const token = jwt.sign({ user_id: user._id, email: user.email, role: user.role }, jwt_key, { expiresIn: jwt_expiry });

        res.status(200).json({
            status: "success",
            message: "Login successful",
            token: token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({
            status: "failed",
            message: err.message
        });
    }
}

async function getProfile(req, res) {
    return res.status(200).json({
        status: "success",
        data: req.user
    });
}


module.exports = { register, login, getProfile }
