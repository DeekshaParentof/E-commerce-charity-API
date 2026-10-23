const Category = require("../models/categorySchema")

const { uploadToCloudinary } = require("../utils/cloudinary")

async function createCategory(req, res) {
    try {
        const { title } = req.body

        if (req.user.role !== "admin" && req.user.role !== "super_admin") {
            return res.status(403).json({
                status: "Failed",
                message: "Only admin and super admin can create a category"
            });
        }

        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                status: "Failed",
                message: "Image is required"
            })
        }

        const imageURL = await uploadToCloudinary(req.file.buffer)

        const newCategory = {
            title,
            image: imageURL,
            user_id: req.user._id
        }

        const data = await Category.create(newCategory)

       return res.status(201).json({
            status: "Success",
            message: "Category created successfully",
            data: data
        })
    }
    catch (err) {
        return res.status(500).json({
            status: "Failed",
            message: err.message
        })
    }
}

async function getAllCategories(req, res) {
    try {
        const data = await Category.find()
        return res.status(200).json({
            status: "success",
            message: "Here is all the categories",
            data: data
        })

    } catch (err) {
        return res.status(500).json({
            status: "Failed",
            message: err.message
        })
    }
}

async function getCategoriesOfAdmin(req, res) {
    try {
        if (req.user.role == "admin") {
            // console.log(req.user_id);
            const admin_data = await Category.find({ user_id: req.user._id }).populate({
                path: "user_id",
                select: "name"
            })
            return res.status(200).json({
                status: "success",
                data: admin_data
            })
        } else if (req.user.role == "super_admin") {
            const data = await Category.find().populate({
                path: "user_id",
                select: "name"
            })
            return res.status(200).json({
                status: "success",
                message: "Here is all the categories",
                data: data
            })
        } else {
            return res.status(403).json({
                status: "Failed",
                message: "Not authorized"
            })
        }
    } catch (err) {
        return res.status(500).json({
            status: "Failed",
            message: err.message
        })
    }
}

async function updateCategory(req, res) {
    try {
        const { id } = req.params
        if (req.user.role == "admin") {
            let category = await Category.findOne({ _id: id })
            if (!category) {                  
                   return res.status(404).json({
                    status: "Failed",
                    message: "Category not found"
                });              
            } 
            
            if (category.user_id.toString() !== req.user_id.toString()) {
                return res.status(403).json({
                    status: "Failed",
                    message: "Not authorized"
                });
            }
            const { title } = req.body
                let updated_category = await Category.updateOne({ _id: id }, { $set: { title: title } });
                return res.status(201).json({
                    status: "seccess",
                    message: "Updation successful!!!",
                    data: updated_category
                })
        } else if (req.user.role == "super_admin") {
            let category = await Category.findOne({ _id: id })
            if (category) {
                const { title } = req.body
                let updated_category = await Category.updateOne({ _id: id }, { $set: { title: title } });
                return res.status(201).json({
                    status: "seccess",
                    message: "Updation successful!!!",
                    data: {
                        data: updated_category
                    }
                })
            } else {
                return res.status(404).json({
                    status: "failed",
                    message: "Category not found"
                });
            }
        }else {
            return res.status(403).json({
                status:"Failed",
                message:"Not authorized"
            })
        }
    } catch (err) {
        return res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
}

module.exports = { createCategory, getAllCategories, getCategoriesOfAdmin,updateCategory };