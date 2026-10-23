const express = require("express")
const router = express.Router()

const { authenticateUser } = require("../middlewares/auth")
const { registerValidationSchema,validateUserRegister } = require("../middlewares/validateRegister")
const { loginValidationSchema, validateUserLogin } = require("../middlewares/validateLogin")

const {register, login, getProfile} =require("../controllers/user")

router.post("/register",registerValidationSchema,validateUserRegister, register);
router.post("/login",loginValidationSchema,validateUserLogin, login);
router.get("/me",authenticateUser, getProfile);

module.exports= router
