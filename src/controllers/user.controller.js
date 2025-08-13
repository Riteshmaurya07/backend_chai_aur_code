const bcrypt = require('bcrypt');
const { asyncHandler } = require('../utils/asyncHandler.js');
const { ApiError } = require('../utils/ApiError.js');
const { User } = require('../models/user.model.js');
const { uploadCloudinary } = require('../utils/cloudinary.js');
const { ApiResponse } = require('../utils/ApiResponse.js');
const jwt = require('jsonwebtoken');

const generateAccessAndRefereshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save(validateBeforeSave = false);
    return { accessToken, refreshToken, user };
  } catch (error) {
    throw new ApiError("Error generating refresh and access tokens", 500);

  }
}


const registerUser = asyncHandler(async (req, res) => {
  const { name, email, username, password } = req.body;
  console.log("User details:", email);

  if ([name, email, username, password].some(field => field?.trim() === '')) {
    throw new ApiError("All fields are required", 400);
  }

  const existedUser = await User.findOne({
    $or: [
      { username },
      { email }
    ]
  });

  if (existedUser) {
    throw new ApiError("User already exists with email or username", 409);
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError("Avatar image is required", 400);
  }

  const avatarUpload = await uploadCloudinary(avatarLocalPath);
  const coverUpload = coverLocalPath ? await uploadCloudinary(coverLocalPath) : null;

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await new User({
    username: username.toLowerCase(),
    email,
    fullName: name,
    password,
    avatar: avatarUpload.secure_url,
    coverImage: coverUpload?.secure_url || ""
  });

  const savedUser = await newUser.save();
  const createdUser = await User.findById(savedUser._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError("User not created", 500);
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  );
})

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError("username or email is required", 400);
  }
  const user = await User.findOne({
    $or: [
      { username },
      { email }
    ]
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError("Invalid user credentials", 401);
  }
  const { refreshToken, accessToken } = await generateAccessAndRefereshToken(user._id)
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  const options = {
    httpOnly: true,
    secure: true,
  }

  return res.status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, {
      user: loggedInUser,
      accessToken,
      refreshToken

    },
      "User logged in successfully"
    ));
})


const logOutUser = asyncHandler(async (req, res) => {
  console.log("Logging out user:");
  await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: "" } }, { new: true });
  const options = {
    httpOnly: true,
    secure: true,
  }
  return res.status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));

});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError("Refresh token is required", 400);
  }
  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  if (!decodedToken) {
    throw new ApiError("Invalid refresh token", 401);
  }
  const user = await User.findById(decodedToken?._id);
  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(" refresh token is expired", 401);
  }
  const { accessToken, newRefreshToken } = await generateAccessAndRefereshToken(user._id);

  const options = {
    httpOnly: true,
    secure: true,
  }
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(200, {
        accessToken,
        refreshToken: newRefreshToken,
      },
        "Access token refreshed successfully"
      )
    )
}
);
module.exports = { registerUser, loginUser, logOutUser, generateAccessAndRefereshToken, refreshAccessToken };
