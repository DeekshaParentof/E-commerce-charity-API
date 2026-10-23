const Charity = require("../models/charitySchema")

const { uploadToCloudinary } = require("../utils/cloudinary")

async function createCharity(req, res) {
    try {
        const { name, description, charity_email, start_date, end_date, platform_fee, donation_fee, profit, status } = req.body

        if (req.user.role !== "admin" && req.user.role !== "super_admin") {
            return res.status(403).json({
                status: "Failed",
                message: "Only admin and super admin can create a charity"
            });
        }

        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                status: "Failed",
                message: "Banner is required"
            })
        }

        if (Number(platform_fee) + Number(donation_fee) + Number(profit) > 100) {
            return res.status(400).json({
                status: "Failed",
                message: "Sum of donation fee + platform fee + profit should not exceed 100"
            })
        }

        const bannerURL = await uploadToCloudinary(req.file.buffer)

        const newCharity = {
            name, description,
            banner: bannerURL,
            user_id: req.user._id,
            charity_email,
            start_date, end_date,
            platform_fee, donation_fee, profit,
            status
        }

        const data = await Charity.create(newCharity)

        return res.status(201).json({
            status: "Success",
            message: "Charity created successfully",
            data: data
        })


    } catch (err) {
        return res.status(500).json({
            status: "Failed",
            message: err.message
        })
    }
}

async function getAllCharities(req, res) {
    try {
        const data = await Charity.find()
        return res.status(200).json({
            status: "success",
            message: "Here is all the charities",
            data: data
        })

    } catch (err) {
        return res.status(500).json({
            status: "Failed",
            message: err.message
        })
    }
}

async function getCharitiesOfAdmin(req, res) {
    try {
        if (req.user.role == "admin") {
            // console.log(req.user_id);

            const admin_data = await Charity.find({ user_id: req.user._id }).populate({
                path: "user_id",
                select: "name"
            })
            return res.status(200).json({
                status: "success",
                data: admin_data
            })
        } else if (req.user.role == "super_admin") {
            const data = await Charity.find().populate({
                path: "user_id",
                select: "name"
            })
            return res.status(200).json({
                status: "success",
                message: "Here is all the charities",
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

async function getCharityById(req, res) {
    try {
        const { id } = req.params
        const charity = await Charity.findOne({ _id: id })
        if (!charity) {
            return res.status(404).json({
                status: "Failed",
                message: "Charity not found"
            })
        }
        res.status(200).json({
            status: "success",
            data: charity
        })

    } catch (err) {
        return res.status(500).json({
            status: "Success",
            message: err.message
        })
    }
}

// const mongoose = require("mongoose");

async function getCharityByIdOfAdmin(req, res) {
    try {
        const { id } = req.params;

        // if (!mongoose.Types.ObjectId.isValid(id)) {
        //     return res.status(400).json({
        //         status: "Failed",
        //         message: "Invalid charity ID"
        //     });
        // }
        if (req.user.role === "admin") {
            const charity = await Charity.findOne({ _id: id })
                .populate({ path: "user_id", select: "name" });

            if (!charity) {
                return res.status(404).json({
                    status: "Failed",
                    message: "Charity not found"
                });
            }

            if (charity.user_id._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    status: "Failed",
                    message: "Not authorized to view this charity"
                });
            }

            return res.status(200).json({
                status: "Success",
                data: charity
            });

        } else if (req.user.role === "super_admin") {
            const charity = await Charity.findOne({ _id: id })
                .populate({ path: "user_id", select: "name" });

            if (!charity) {
                return res.status(404).json({
                    status: "Failed",
                    message: "Charity not found"
                });
            }

            return res.status(200).json({
                status: "Success",
                data: charity
            });

        } else {
            return res.status(403).json({
                status: "Failed",
                message: "Not authorized"
            });
        }

    } catch (err) {
        return res.status(500).json({
            status: "Failed",
            message: err.message
        });
    }
}

async function updateCharity(req, res) {
    try {
        const { id } = req.params;

        if (req.user.role == "admin") {
            const charity = await Charity.findOne({ _id: id });
            if (!charity) {
                return res.status(404).json({
                    status: "Failed",
                    message: "Charity not found"
                });
            }

            if (charity.user_id.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    status: "Failed",
                    message: "Not authorized"
                });
            }

            const { name, description, charity_email, start_date, end_date, platform_fee, donation_fee, profit, status } = req.body;

            const updated_charity = await Charity.updateOne(
                { _id: id },
                {
                    $set: {
                        name,
                        description,
                        charity_email,
                        start_date,
                        end_date,
                        platform_fee,
                        donation_fee,
                        profit,
                        status
                    }
                }
            );

            return res.status(201).json({
                status: "success",
                message: "Charity updated successfully",
                data: updated_charity
            });

        } else if (req.user.role == "super_admin") {
            const charity = await Charity.findOne({ _id: id });
            if (!charity) {
                return res.status(404).json({
                    status: "Failed",
                    message: "Charity not found"
                });
            }

            const { name, description, charity_email, start_date, end_date, platform_fee, donation_fee, profit, status } = req.body;

            const updated_charity = await Charity.updateOne(
                { _id: id },
                {
                    $set: {
                        name,
                        description,
                        charity_email,
                        start_date,
                        end_date,
                        platform_fee,
                        donation_fee,
                        profit,
                        status
                    }
                }
            );

            return res.status(201).json({
                status: "success",
                message: "Charity updated successfully",
                data: updated_charity
            });

        } else {
            return res.status(403).json({
                status: "Failed",
                message: "Not authorized"
            });
        }

    } catch (err) {
        return res.status(500).json({
            status: "Failed",
            message: err.message
        });
    }
}



module.exports = { createCharity, getAllCharities, getCharitiesOfAdmin, getCharityById,getCharityByIdOfAdmin, updateCharity }