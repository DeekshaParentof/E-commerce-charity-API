require("dotenv").config();
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const fs = require("fs")
const path = require("path")

const Product = require("../models/productSchema");
const Charity = require("../models/charitySchema");
const Address = require("../models/adressSchema")
const Order = require("../models/orderSchema");

const orderTemplate = fs.readFileSync(path.join(__dirname, "../utils/orders.html"), "utf8");
const charityTemplate = fs.readFileSync(path.join(__dirname, "../utils/charity.html"), "utf8");

const sender_email = process.env.EMAIL_USER
const email_password = process.env.EMAIL_PASS
const recipient_email = process.env.TEST_RECIPIENT_EMAIL

const twilio_sid = process.env.TWILIO_SID
const auth_token = process.env.TWILIO_AUTH_TOKEN
const twilio_phno = process.env.TWILIO_PHONE_NUMBER
const recipient_phno = process.env.TEST_RECIPIENT_PHONE

// Notifications are optional: they are only set up when credentials exist,
// and a failure never affects the order that was already placed.
const smsClient = twilio_sid && auth_token && twilio_phno && recipient_phno
    ? twilio(twilio_sid, auth_token)
    : null;

const transporter = sender_email && email_password
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: sender_email,
            pass: email_password
        }
    })
    : null;

const orderPopulate = [
    { path: "product_id", select: "title image price discount short_description" },
    { path: "charity_id", select: "name banner" }
];

function calculatePrice(product) {
    const discount = Math.min(Math.max(Number(product.discount) || 0, 0), 100);
    const unitPrice = Math.round(product.price * (100 - discount)) / 100;
    return { discount, unitPrice };
}

async function sendOrderNotifications({ user, product, charity, order, quantity, unitPrice, addressStr }) {
    const productRow = `
        <tr>
            <td>${product.title}</td>
            <td align="center">${quantity}</td>
            <td align="right">₹${unitPrice}</td>
        </tr>`;

    if (smsClient) {
        try {
            await smsClient.messages.create({
                body: `Hi ${user.name}, your order for ${quantity} x ${product.title} is confirmed.`,
                from: twilio_phno,
                to: recipient_phno
            });
        } catch (err) {
            console.error("SMS notification failed:", err.message);
        }
    }

    if (!transporter) return;

    try {
        let userHtml = orderTemplate
            .replace(/{{customerName}}/g, user.name)
            .replace(/{{orderId}}/g, order._id.toString())
            .replace(/{{totalAmount}}/g, order.amount)
            .replace(/{{address}}/g, addressStr)
            .replace(/{{#each products}}[\s\S]*?{{\/each}}/g, productRow);

        await transporter.sendMail({
            from: sender_email,
            to: recipient_email || user.email,
            subject: "Order Confirmation",
            html: userHtml
        });
    } catch (err) {
        console.error("Order email failed:", err.message);
    }

    try {
        let charityHtml = charityTemplate
            .replace(/{{charityOwnerName}}/g, charity.user_id?.name || charity.name)
            .replace(/{{customerName}}/g, user.name)
            .replace(/{{address}}/g, addressStr)
            .replace(/{{#each products}}[\s\S]*?{{\/each}}/g, productRow);

        await transporter.sendMail({
            from: sender_email,
            to: recipient_email || charity.charity_email,
            subject: "New Donation Order Received",
            html: charityHtml,
        });
    } catch (err) {
        console.error("Charity email failed:", err.message);
    }
}

async function placeOrder(req, res) {
    try {
        const { product_id, charity_id, quantity, address_id } = req.body;
        const user = req.user;

        const address = address_id
            ? await Address.findOne({ _id: address_id, user_id: user._id })
            : await Address.findOne({ user_id: user._id }).sort({ createdAt: -1 });
        if (!address) {
            return res.status(400).json({
                status: "Failed",
                message: "Address details are required to place an order"
            });
        }

        const product = await Product.findOne({ _id: product_id });
        if (!product) {
            return res.status(404).json({ status: "Failed", message: "Product not found" });
        }

        if (product.charity_id.toString() !== charity_id.toString()) {
            return res.status(400).json({
                status: "Failed",
                message: "Product does not belong to this charity"
            });
        }

        const charity = await Charity.findOne({ _id: charity_id }).populate("user_id", "name");
        if (!charity) {
            return res.status(404).json({
                status: "Failed",
                message: "Charity not found"
            });
        }

        if (product.status !== "active") {
            return res.status(400).json({
                status: "Failed",
                message: "Product must be active"
            });
        }
        if (charity.status !== "live") {
            return res.status(400).json({
                status: "Failed",
                message: "Charity must be live"
            });
        }

        // Decrement stock atomically so two concurrent orders can't oversell.
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: product_id, quantity: { $gte: quantity } },
            { $inc: { quantity: -quantity } },
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(400).json({
                status: "Failed",
                message: `Only ${product.quantity} units available`
            });
        }
        if (updatedProduct.quantity === 0) {
            await Product.updateOne({ _id: product_id }, { $set: { status: "sold" } });
        }

        const { discount, unitPrice } = calculatePrice(product);
        const totalAmount = Math.round(unitPrice * quantity * 100) / 100;

        const order = await Order.create({
            user_id: user._id,
            product_id,
            charity_id,
            quantity,
            unit_price: unitPrice,
            discount,
            amount: totalAmount,
            address_id: address._id,
            shipping_address: {
                location: address.location,
                city: address.city,
                pincode: address.pincode,
                state: address.state,
                country: address.country
            }
        });

        const addressStr = `${address.location}, ${address.city}, ${address.state}, ${address.country} - ${address.pincode}`;

        // Fire-and-forget: the response doesn't wait on SMS/email delivery.
        sendOrderNotifications({ user, product, charity, order, quantity, unitPrice, addressStr });

        return res.status(201).json({
            status: "Success",
            message: "Order placed successfully",
            data: order
        });

    } catch (err) {
        return res.status(500).json({
            status: "Failed",
            message: err.message
        });
    }
}


async function getOrderOfUser(req, res) {
    try {
        const order = await Order.find({ user_id: req.user_id })
            .populate(orderPopulate)
            .sort({ createdAt: -1 })

        return res.status(200).json({
            status: "Success",
            message: "Here are your orders",
            data: order
        })
    } catch (err) {
        return res.status(500).json({
            status: "Failed",
            message: err.message
        });
    }
}

async function canViewCharityOrders(user, charity_id) {
    if (user.role === "super_admin") return true;
    if (user.role !== "admin") return false;
    const charity = await Charity.findOne({ _id: charity_id, user_id: user._id });
    return Boolean(charity);
}

async function getOrderById(req, res) {
    try {
        const { id } = req.params
        const order = await Order.findOne({ _id: id }).populate(orderPopulate)
        if (!order) {
            return res.status(404).json({
                status: "Failed",
                message: "Order not found"
            })
        }

        const isOwner = order.user_id.toString() === req.user_id.toString();
        if (!isOwner && !(await canViewCharityOrders(req.user, order.charity_id._id))) {
            return res.status(404).json({
                status: "Failed",
                message: "Order not found"
            })
        }

        return res.status(200).json({
            status: "Success",
            data: order
        })
    } catch (err) {
        return res.status(500).json({
            status: "Failed",
            message: err.message
        });
    }
}

async function getOrderByCharityId(req, res) {
    try {
        const { charity_id } = req.params;

        if (!(await canViewCharityOrders(req.user, charity_id))) {
            return res.status(403).json({
                status: "Failed",
                message: "Not authorized"
            });
        }

        const orders = await Order.find({ charity_id: charity_id })
            .populate(orderPopulate)
            .sort({ createdAt: -1 })

        return res.status(200).json({
            status: "Success",
            message: "Here are the orders under this charity",
            data: orders
        });

    } catch (err) {
        return res.status(500).json({
            status: "Failed",
            message: err.message
        });
    }
}

module.exports = { placeOrder, getOrderOfUser, getOrderById, getOrderByCharityId };
