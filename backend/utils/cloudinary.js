const cloudinary = require("cloudinary").v2
require("dotenv").config()

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME
const api_key = process.env.CLOUDINARY_API_KEY
const api_secret = process.env.CLOUDINARY_API_SECRET

cloudinary.config({
    cloud_name,
    api_key,
    api_secret
})

function uploadToCloudinary(buffer){
    if (!cloud_name || !api_key || !api_secret) {
        return Promise.reject(new Error("Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env"))
    }
    return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: process.env.CLOUDINARY_FOLDER || "charity-shop" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  })
}

module.exports = { uploadToCloudinary }
