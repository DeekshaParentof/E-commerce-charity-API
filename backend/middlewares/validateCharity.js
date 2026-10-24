const { body, validationResult } = require("express-validator");

const UTC_FORMAT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const personalDomains = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "rediffmail.com", "icloud.com", "aol.com"
];

const commonRules = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .matches(/^[A-Za-z][A-Za-z\s&'.-]*$/).withMessage("Name should contain letters and spaces only")
        .isLength({ max: 60 }).withMessage("Name should not exceed 60 characters"),

    body("description")
        .trim()
        .notEmpty().withMessage("Description is required")
        .isLength({ max: 100 }).withMessage("Description should not exceed 100 characters.")
        .isLength({ min: 30 }).withMessage("Description should atleat contain 30 characters."),

    body("charity_email")
        .trim()
        .notEmpty().withMessage("Charity email is required")
        .isEmail().withMessage("Email should be valid")
        .custom((value) => {
            const domain = value.split("@")[1].toLowerCase();
            if (personalDomains.includes(domain)) {
                throw new Error("Charity email must be from an official organization domain, not a personal email provider");
            }
            return true;
        }),

    body("end_date")
        .notEmpty().withMessage("End date is required")
        .matches(UTC_FORMAT)
        .withMessage("End date must be in UTC format: YYYY-MM-DDTHH:mm:ssZ")
        .custom((value, { req }) => {
            const endDate = new Date(value);
            const startDate = new Date(req.body.start_date);

            if (endDate <= startDate) {
                throw new Error("End date must be greater than start date");
            }
            return true;
        }),

    body(["platform_fee", "donation_fee", "profit"])
        .optional({ values: "falsy" })
        .isFloat({ min: 0, max: 100 }).withMessage("Fees and profit must be percentages between 0 and 100"),

    body("status")
        .optional({ values: "falsy" })
        .isIn(["pending", "approved", "live", "closed"])
        .withMessage("Status must be one of: pending, approved, live, closed"),
]

const charityValidationSchema = [
    ...commonRules,

    body("start_date")
        .notEmpty().withMessage("Start date is required")
        .matches(UTC_FORMAT)
        .withMessage("Start date must be in UTC format: YYYY-MM-DDTHH:mm:ssZ")
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error("Start date must be greater than the current date and time");
            }
            return true;
        }),

    body("platform_fee")
        .default(10),

    body("donation_fee")
        .default(70),

    body("profit")
        .default(20)
]

// Same as create, except a charity that has already started can still be edited.
const charityUpdateValidationSchema = [
    ...commonRules,

    body("start_date")
        .notEmpty().withMessage("Start date is required")
        .matches(UTC_FORMAT)
        .withMessage("Start date must be in UTC format: YYYY-MM-DDTHH:mm:ssZ"),
]

function validateCharity(req, res, next) {
    const result = validationResult(req)
    if (!result.isEmpty()) {
        const err = result.array()
        return res.status(400).json({
            message: err[0].msg
        })
    } else {
        next();
    }
}

module.exports = { charityValidationSchema, charityUpdateValidationSchema, validateCharity }
