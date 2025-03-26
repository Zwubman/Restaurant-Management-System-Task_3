import mongoose from "mongoose";
import Inventory from "../Models/inventoryModel.js";
import Restaurant from "../Models/restaurantModel.js";

//Create inventory
export const addInventory = async (req, res) => {
  try {
    const { ingredientName, ingredientCategory, availableQuantity, unit } =
      req.body;

    const restaurantId = req.params.id;
    const restaurant = await Restaurant.findOnee({ _id: restaurantId });

    if (!restaurantId) {
      return res.status(404).json({ message: "Restaurant not foun." });
    }

    const inventory = await new Inventory({
      ingredientName,
      ingredientCategory,
      availableQuantity,
      unit,
    });

    await inventory.save();

    res
      .status(200)
      .json({ message: "Inventory is added successfully.", inventory });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to add inventory.", error });
  }
};
