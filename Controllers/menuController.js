import mongoose from "mongoose";
import Menu from "../Models/menuModel.js";
import Restaurant from "../Models/restaurantModel.js";

//Add a items into menu
export const addMenuItem = async (req, res) => {
  try {
    const { menuItemName, catagory, price, isAvailable, ingredient } = req.body;

    const restaurantId = req.params.id;
    const restaurant = await Restaurant.findOne({_id: restaurantId});

    if(!restaurant){
      return res.status(404).json({message: "Restaurant not found."});
    }

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
      ingredient,
      restaurantId: restaurantId
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
    const { menuItemName, catagory, price, isAvailable, ingredient } = req.body;
    const menuId = req.params.id;

    const item = await Menu.findOneAndUpdate(
      {_id: menuId},
      { $set: req.body},
      {new: true}
    );

    if(!item){
      return res.status(404).json({message: "Item not found and not update."});
    }


  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to update item in menu." });
  }
};
