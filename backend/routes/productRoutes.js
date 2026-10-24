const express = require("express")
const router = express.Router()
const {authenticateUser} = require("../middlewares/auth")
const {uploadFile, uploadOptionalFile} = require("../middlewares/multer")
const {productValidationSchema, productUpdateValidationSchema, validateProduct} = require("../middlewares/validateProduct")
const {createProduct,updateProduct,updateProductStatus,getAllProducts,getProductsByCharityIdForAdmin,getAllProductsByCharityId,getAllProductsByCategoryId,getProductById} = require("../controllers/products")


router.post("/",authenticateUser,uploadFile("image"),productValidationSchema,validateProduct,createProduct);
router.put("/:id",authenticateUser,uploadOptionalFile("image"),productUpdateValidationSchema,validateProduct,updateProduct)
router.patch("/:id",authenticateUser,updateProductStatus)
router.get("/",getAllProducts)
router.get("/admin/charity/:id",authenticateUser,getProductsByCharityIdForAdmin)
router.get("/charity/:id",getAllProductsByCharityId)
router.get("/category/:id",getAllProductsByCategoryId)
router.get("/:id",getProductById)

module.exports = router

