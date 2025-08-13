const dotenv = require("dotenv");
dotenv.config({ path: '../../.env' });
const {ApiError} = require("../utils/ApiError.js");
const bcrypt = require("bcrypt");
const {User} = require("../models/user.model.js");
const {asyncHandler} = require("../utils/asyncHandler.js");
const jwt = require("jsonwebtoken");


 const verifyJwt = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers["Authorization"]?.replace("Bearer ", "");
        
        if (!token) {
            throw new ApiError("Access token is required", 401);
        }
    
        const decodedToken=jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);
        console.log("kuch to hone wala hai",decodedToken);
        const user=await User.findById(decodedToken.id).select("-password -refreshToken")
            console.log("User found:", user);
        if (!user) {
            throw new ApiError("User not found", 404);
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(error?.message|| "Invalid access token", 401);        
    }
});
module.exports = { verifyJwt };
