const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

function checkImage(req, res) {
    const imgTypes = /^image\/(jpg|jpeg|png)$/;
    if (!imgTypes.test(req.file.mimetype)) {
        res.status(400).json({
            status: "Failed",
            message: "Only .png, .jpg and .jpeg formats are allowed!"
        });
        return false;
    }

    if (req.file.size > 1 * 1024 * 1024) {
        res.status(400).json({
            status: "Failed",
            message: "Image file should not exceed 1MB",
        });
        return false;
    }
    return true;
}

// Requires an image in `fieldName` (used when creating records).
function uploadFile(fieldName) {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({
                    status: "Failed",
                    message: `Missing required field: ${fieldName}`,
                    hint: `Make sure you're sending the file with field name '${fieldName}'`,
                });
            }

            if (checkImage(req, res)) next();
        });
    };
}

// Accepts an optional replacement image in `fieldName` (used when updating records).
function uploadOptionalFile(fieldName) {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            if (!req.file || checkImage(req, res)) next();
        });
    };
}

module.exports = { uploadFile, uploadOptionalFile };
