import mongoose from "mongoose";
import Inventory from "../Models/inventoryModel.js";
import Restaurant from "../Models/restaurantModel.js";

//Create Ingredient
export const addInventory = async (req, res) => {
  try {
    const { ingredientName, ingredientCategory, availableQuantity, unit } =
      req.body;

    const restaurantId = req.params.id;
    const restaurant = await Restaurant.findOne({ _id: restaurantId });

    if (!restaurantId) {
      return res.status(404).json({ message: "Restaurant not foun." });
    }

    const existingInventory = await Inventory.findOne({
      ingredientName,
      restaurantId,
    });

    if (existingInventory) {
      return res.status(303).json({ message: "Inventory already added." });
    }

    const inventory = await new Inventory({
      ingredientName,
      ingredientCategory,
      availableQuantity,
      unit,
      restaurantId: restaurantId,
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

//Get all Ingredient created early
export const getAllIngredient = async (req, res) => {
  try {
    const ingredients = await Inventory.find();

    if (!ingredients) {
      return res.status(404).json({
        message: "There is not registered ingredient in inventory model.",
      });
    }

    res.status(200).json({ message: "All ingredients:", ingredients });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Fail to fetch all created ingredient.", error });
  }
};

//Update created ingredient
export const updateInventoryById = async (req, res) => {
  try {
    const { ingredientName, ingredientCategory, availableQuantity, unit } =
      req.body;

    const inventoryId = req.params.id;

    const inventory = await Inventory.findOneAndUpdate(
      { _id: inventoryId },
      {
        $set: {
          ingredientName,
          ingredientCategory,
          availableQuantity,
          unit,
        },
      },
      { new: true }
    );

    if (!inventory) {
      return res
        .status(404)
        .json({ message: "Inventory not found and Fail to update." });
    }

    res
      .status(200)
      .json({ message: "Inventory updated successfull.", inventory });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to update inventory.", error });
  }
};
