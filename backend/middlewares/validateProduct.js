const { body, validationResult } = require("express-validator");

// New products start with 25-50 units; edits allow any non-negative stock
// (stock drops below 25 as orders come in).
const quantityRules = {
    create: body("quantity")
        .notEmpty().withMessage("Quantity is required")
        .isInt({ min: 25, max: 50 })
        .withMessage("Quantity must be between 25 and 50"),
    update: body("quantity")
        .notEmpty().withMessage("Quantity is required")
        .isInt({ min: 0 })
        .withMessage("Quantity must be 0 or more"),
};

const productRules = (mode) => [
    body("title")
        .notEmpty().withMessage("Title is required")
        .isString().withMessage("Title must be a string"),

    body("short_description")
        .notEmpty().withMessage("Short description is required")
        .isLength({ min: 10, max: 15 })
        .withMessage("Short description must be between 10 and 15 characters"),

    body("long_description")
        .notEmpty().withMessage("Long description is required")
        .isLength({ min: 20, max: 50 })
        .withMessage("Long description must be between 20 and 50 characters"),

    quantityRules[mode],

    body("price")
        .notEmpty().withMessage("Price is required")
        .isFloat({ min: 1 }).withMessage("Price must be a positive number"),

    body("discount")
        .optional()
        .isFloat({ min: 0, max: 100 }).withMessage("Discount must be a percentage between 0 and 100")
        .default(0),

    body("status")
        .optional()
        .isIn(["pending", "active", "sold", "inactive"])
        .withMessage("Status must be one of: pending, active, sold, inactive"),

    body("charity_id")
        .notEmpty().withMessage("Charity ID is required")
        .isMongoId().withMessage("Charity ID must be a valid ObjectId"),

    body("category_id")
        .notEmpty().withMessage("Category ID is required")
        .isMongoId().withMessage("Category ID must be a valid ObjectId"),
];

const productValidationSchema = productRules("create");
const productUpdateValidationSchema = productRules("update");

function validateProduct(req, res, next) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const err = result.array();
        return res.status(400).json({
            message: err[0].msg
        });
    } else {
        next();
    }
}

module.exports = { productValidationSchema, productUpdateValidationSchema, validateProduct };
