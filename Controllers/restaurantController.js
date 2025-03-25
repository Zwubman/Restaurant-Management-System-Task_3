import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cookie from "cookie-parser";
import bcrypt from "bcryptjs";
import Restaurant from "../Models/restaurantModel.js";

//Register new Restaurant
export const registerRestaurant = async (req, res) => {
  try {
    const {
      restaurantName,
      restaurantPassword,
      restaurantCountry,
      restaurantEmail,
      restaurantPhone,
      restaurantAddress,
    } = req.body;

    const isRegistered = await Restaurant.findOne({ restaurantEmail });

    if (isRegistered) {
      return res
        .status(400)
        .json({ message: "Restaurant already registered." });
    }

    const restaurant = await new Restaurant({
        restaurantName,
        restaurantEmail,
        restaurantPassword,
        restaurantPhone,
        restaurantCountry,
        restaurantAddress
    });

    await restaurant.save();

    res.status(200).json({message: "Restaurant register successfully.", restaurant});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to register restaurant.", error });
  }
};
