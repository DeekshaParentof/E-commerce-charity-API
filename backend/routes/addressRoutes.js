const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");
const { addressValidationSchema, validateAddress } = require("../middlewares/validateAddress");
const { addAddress, getAddressOfUser, updateAddressOfUser,deleteAddressOfUser } = require("../controllers/address");


router.post( "/", authenticateUser,addressValidationSchema, validateAddress, addAddress);
router.get("/",authenticateUser,getAddressOfUser)
router.put("/:id",authenticateUser,addressValidationSchema, validateAddress,updateAddressOfUser)
router.delete("/:id",authenticateUser,deleteAddressOfUser)

module.exports = router;
