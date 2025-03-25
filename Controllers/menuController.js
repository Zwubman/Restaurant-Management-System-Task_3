import mongoose from "mongoose";
import Menu from "../Models/menuModel.js";

//Add a items into menu
export const addMenuItem = async (req, res) => {
  try {
    const { menuItemName, catagory, price, isAvailable, ingredient } = req.body;

    const isAdded = await Menu.findOne({ menuItemName });

    if (isAdded) {
      return res
        .status(300)
        .json({ message: "Item is already added into the menu." });
    }

    const item = await new Menu({
        menuItemName,
        catagory,
        price,
        isAvailable,
        ingredient
    });

    await item.save();

    res.status(200).json({message: "Item added successfully into the menu.", item});
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail adding items int menu.", error });
  }
};
