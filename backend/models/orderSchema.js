const mongoose = require("mongoose")

// Snapshot of the delivery address at the time of ordering, so later
// edits/deletes of the user's address book don't change past orders.
const shippingAddressSchema = new mongoose.Schema({
    location: String,
    city: String,
    pincode: Number,
    state: String,
    country: String
}, { _id: false })

const orderSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    product_id:{
        type:mongoose.Types.ObjectId,
        ref:"Product",
        required:true
    },
    charity_id:{
        type:mongoose.Types.ObjectId,
        ref:"Charity",
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    unit_price:{
        type:Number
    },
    discount:{
        type:Number,
        default:0
    },
    amount:{
        type:Number,
    },
    address_id:{
        type:mongoose.Types.ObjectId,
        ref:"Address"
    },
    shipping_address:{
        type: shippingAddressSchema
    }
},{timestamps:true})

const Order = mongoose.model("Order",orderSchema)

module.exports = Order
