const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const uploadFile = async(filePath) => {
    try {
        if (!filePath) {
            throw new Error("File path is required for upload");
        }
        const response =await cloudinary.uploader.upload(filePath, { resource_type: "auto" })
        console.log("File uploaded successfully:", response);
        return response;
    }catch (error) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // remove file if upload fails
        }
        throw new Error(`Upload failed: ${error.message}`);
    };
};

module.exports = { uploadCloudinary: uploadFile };