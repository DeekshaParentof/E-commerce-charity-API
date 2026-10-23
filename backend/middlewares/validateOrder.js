const {body, validationResult} = require("express-validator")

const orderValidationSchema = [
    body("product_id")
    .notEmpty().withMessage("Product ID is required")
    .isMongoId().withMessage("Product ID should be a valid ObjectId"),

    body("charity_id")
    .notEmpty().withMessage("Charity ID is required")
    .isMongoId().withMessage("Charity ID should be a valid ObjectId"),

    body("quantity")
    .notEmpty().withMessage("Quantity is required")
    .isInt({ min: 1 }).withMessage("Quantity must be at least 1")
    .toInt(),

    body("address_id")
    .optional()
    .isMongoId().withMessage("Address ID should be a valid ObjectId")

]

function validateOrder(req,res,next){
    const result = validationResult(req)
    if(!result.isEmpty()){
        const err = result.array()
        return res.status(400).json({
            status:"Failed",
            message:err[0].msg
        })
    }else{
        next();
    }
}

module.exports = {orderValidationSchema,validateOrder}
