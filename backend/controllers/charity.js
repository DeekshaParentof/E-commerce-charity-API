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

        if (status && req.user.role === "admin" && !ADMIN_STATUSES.includes(status)) {
            return res.status(403).json({
                status: "Failed",
                message: "Only a super admin can approve a charity or make it live"
            });
        }

        if (feesExceed100({ platform_fee, donation_fee, profit })) {
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
            status: status || "pending"
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

// Admins may only keep their charities pending or close them;
// approving / going live is a super admin decision.
const ADMIN_STATUSES = ["pending", "closed"];

function feesExceed100({ platform_fee, donation_fee, profit }) {
    return Number(platform_fee || 0) + Number(donation_fee || 0) + Number(profit || 0) > 100;
}

async function updateCharity(req, res) {
    try {
        const { id } = req.params;

        if (req.user.role !== "admin" && req.user.role !== "super_admin") {
            return res.status(403).json({
                status: "Failed",
                message: "Not authorized"
            });
        }

        const charity = await Charity.findOne({ _id: id });
        if (!charity) {
            return res.status(404).json({
                status: "Failed",
                message: "Charity not found"
            });
        }

        if (req.user.role === "admin" && charity.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: "Failed",
                message: "Not authorized"
            });
        }

        const { name, description, charity_email, start_date, end_date, status } = req.body;
        const platform_fee = req.body.platform_fee ?? charity.platform_fee;
        const donation_fee = req.body.donation_fee ?? charity.donation_fee;
        const profit = req.body.profit ?? charity.profit;

        if (feesExceed100({ platform_fee, donation_fee, profit })) {
            return res.status(400).json({
                status: "Failed",
                message: "Sum of donation fee + platform fee + profit should not exceed 100"
            });
        }

        if (status && status !== charity.status && req.user.role === "admin" && !ADMIN_STATUSES.includes(status)) {
            return res.status(403).json({
                status: "Failed",
                message: "Only a super admin can approve a charity or make it live"
            });
        }

        charity.set({ name, description, charity_email, start_date, end_date, platform_fee, donation_fee, profit });
        if (status) charity.status = status;
        if (req.file) charity.banner = await uploadToCloudinary(req.file.buffer);
        const updated_charity = await charity.save();

        return res.status(200).json({
            status: "success",
            message: "Charity updated successfully",
            data: updated_charity
        });

    } catch (err) {
        return res.status(500).json({
            status: "Failed",
            message: err.message
        });
    }
}

module.exports = { createCharity, getAllCharities, getCharitiesOfAdmin, getCharityById,getCharityByIdOfAdmin, updateCharity }