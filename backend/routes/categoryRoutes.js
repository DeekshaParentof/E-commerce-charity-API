const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");
const { uploadFile, uploadOptionalFile } = require("../middlewares/multer");
const { categoryValidationSchema, validateCategory } = require("../middlewares/validateCategory");
const { createCategory, getAllCategories,getCategoriesOfAdmin, updateCategory } = require("../controllers/category");


router.post( "/", authenticateUser, uploadFile("image"), categoryValidationSchema, validateCategory, createCategory);
router.get("/",getAllCategories)
router.get("/admin",authenticateUser,getCategoriesOfAdmin)
router.patch("/:id",authenticateUser, uploadOptionalFile("image"), updateCategory)

module.exports = router;
