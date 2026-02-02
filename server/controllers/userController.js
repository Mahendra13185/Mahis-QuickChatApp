import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

/* ======================
   SIGNUP
====================== */
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.json({ success: false, message: "Account already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);
    newUser.password = undefined;

    res.json({
      success: true,
      message: "Account created successfully",
      userData: newUser,
      token,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ======================
   LOGIN
====================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(userData._id);
    userData.password = undefined;

    res.json({
      success: true,
      message: "Login successful",
      userData,
      token,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ======================
   CHECK AUTH  ✅ THIS WAS MISSING
====================== */
export const checkAuth = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

/* ======================
   UPDATE PROFILE
====================== */
export const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, profilePic } = req.body;

    let updatedUser;

    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic);

      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          fullName,
          bio,
          profilePic: upload.secure_url,
        },
        { new: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { fullName, bio },
        { new: true }
      );
    }

    updatedUser.password = undefined;

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
  console.error("CLOUDINARY ERROR:", error);
  res.json({
    success: false,
    message: error.message,
  });
}

};
