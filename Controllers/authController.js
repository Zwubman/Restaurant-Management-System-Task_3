import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cookie from "cookie-parser";
import bcrypt from "bcryptjs";
import User from "../Models/userModel.js";

// User sign up
export const signUp = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, phone, password } =
      req.body;

    if (!password) {
      return res
        .status(300)
        .json({ message: "password is required, please enter your password." });
    }
    const isExist = await User.findOne({ email });
    if (isExist) {
      return res
        .status(401)
        .json({ message: "User already exist please sign in." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    //Register new user
    const user = new User({
      firstName,
      middleName,
      lastName,
      email,
      password: hashedPassword,
      phone,
    });

    await user.save();

    res.status(200).json({ message: "User sign up successfully.", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to sign up.", error });
  }
};

//Sign in registered user
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User has not sign up plaese sign up before sign in",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.REFRESH_TOKEN_KEY,
      { expiresIn: "30d" }
    );

    res.cookie("accessToken", accessToken);
    res.cookie("refreshToken", refreshToken);

    res.status(200).json({
      message: "Log in successfully.",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({ message: "Fail to sign in", error });
  }
};
