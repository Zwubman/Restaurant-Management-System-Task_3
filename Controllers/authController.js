import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cookie from "cookie-parser";
import User from "../Models/userModel.js";

// User sign up
export const signUp = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, phone, password } =
      req.body;

    const isExist = await User.findOne({ email });
    if (isExist) {
      return res
        .status(401)
        .json({ message: "User already exist please sign in." });
    }

    const user = new User({
      firstName,
      middleName,
      lastName,
      email,
      password,
      phone,
    });

    await user.save();

    res.status(200).json({message: "User sign up successfully.", user});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to sign up." });
  }
};
