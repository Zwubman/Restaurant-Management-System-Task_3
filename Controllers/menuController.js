import mongoose, { modelNames } from "mongoose";
import Menu from "../Models/menuModel.js";
import Restaurant from "../Models/restaurantModel.js";

//Add a items into menu
export const addMenuItem = async (req, res) => {
  try {
    const { menuItemName, category, price, isAvailable, ingredients } =
      req.body;

    const restaurantId = req.params.id;
    const restaurant = await Restaurant.findOne({ _id: restaurantId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const isAdded = await Menu.findOne({ menuItemName });

    if (isAdded) {
      return res
        .status(300)
        .json({ message: "Item is already added into the menu." });
    }

    const item = await new Menu({
      menuItemName,
      category,
      price,
      isAvailable,
      ingredients,
      restaurantId: restaurantId,
    });

    await item.save();

    res
      .status(200)
      .json({ message: "Item added successfully into the menu.", item });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail adding items int menu.", error });
  }
};

//Update items in menu
export const updateMenuItem = async (req, res) => {
  try {
    const { menuItemName, category, price, isAvailable } = req.body;
    const menuId = req.params.id;

    const item = await Menu.findOneAndUpdate(
      { _id: menuId },
      {
        $set: {
          menuItemName,
          category,
          price,
          isAvailable,
        },
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Fail to update Item." });
    }

    res.status(200).json({ message: "Item updated successfully.", item });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to update item in menu." });
  }
};

export const addIngredientsToItem = async (req, res) => {
  try {
    const { ingredients } = req.body;
    const itemId = req.params.id;
    const item = await Menu.findOne({ _id: itemId });

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    // Array to collect new ingredients to be added
    const newIngredients = [];

    // Loop through the ingredients array to process each ingredient
    for (const ingredient of ingredients) {
      const { ingredientId, amountUsedPerItem } = ingredient;

      // Check if the ingredient already exists in the item's ingredients array
      const isExist = item.ingredients.some((ingMenu) => {
        return ingMenu.ingredientId.toString() === ingredientId.toString();
      });

      if (isExist) {
        continue;
      }

      // If ingredient is not present, add it to the newIngredients array
      newIngredients.push({
        ingredientId,
        amountUsedPerItem,
      });
    }

    // If there are new ingredients to add, update the item
    if (newIngredients.length > 0) {
      item.ingredients.push(...newIngredients);
      await item.save();

      return res.status(200).json({
        message: "New ingredient(s) added successfully to the menu item.",
        item,
      });
    } else {
      return res.status(400).json({
        message: "No new ingredients to add. All ingredients already exist.",
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to add ingredient(s) to the menu item." });
  }
};

//Remove existing ingredient of the menu item if it is not neccessary
export const removeIngredeintFromItem = async (req, res) => {
  try {
    const { ingredientId } = req.body;
    const itemId = req.params.id;
    const item = await Menu.findOne({ _id: itemId });
    if (!item) {
      return res.status(404).json({ message: "Menu item is not found." });
    }

    const isExist = await item.ingredients.some((ingMenu) => {
      return ingMenu.ingredientId.toString() === ingredientId.toString();
    });

    if (!isExist) {
      return res.status(404).json({
        message: `Ingredient is not found in ${item.menuItemName} item`,
      });
    }

    item.ingredients = await item.ingredients.filter((ingMenu) => {
      return ingMenu.ingredientId.toString() !== ingredientId.toString();
    });

    await item.save();

    res.status(200).json({ message: "Ingredeint removed successfully.", item });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to remove ingredient." });
  }
};

//Delete menu item from menu
export const deleteMenuItemById = async(req, res) => {
  try{
    const itemId = req.params.id;

    const item = await Menu.findOne({_id: itemId, isAvailable: true});

    if(!item){
      return res.status(404).json({message: "Menu item not found."});
    }

    item.isAvailable = false;

    await item.save();

    res.status(200).json({message: "Menu item deleted successfully.", item});

  }catch(error){
    console.log(error);
    res.status(500).json({message})
  }
}
