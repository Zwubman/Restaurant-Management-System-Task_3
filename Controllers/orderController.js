import mongoose from "mongoose";
import Restaurant from "../Models/restaurantModel.js";
import Order from "../Models/orderModel.js";
import User from "../Models/userModel.js";
import Menu from "../Models/menuModel.js";
import Inventory from "../Models/inventoryModel.js";
import Reserve from "../Models/reserveModel.js";

//To order the item from menu
export const placeOrder = async (req, res) => {
  try {
    const { name, phone, tableNumber, quantity, totalPrice } = req.body;
    const itemId = req.params.id;
    const userId = req.user._id;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found, please log in and use the token in headers.",
      });
    }

    // Verify the table exists
    const table = await Reserve.findOne({ tableNumber });
    if (!table) {
      return res.status(404).json({ message: "Table not found." });
    }

    // Ensure the table reservation is confirmed before allowing the order
    if (table.reservationStatus !== "Confirmed") {
      return res.status(403).json({
        message:
          "You are trying to place the order at the wrong table. Please reserve the table and place an order at your table.",
      });
    }

    // Check if the menu item exists
    const item = await Menu.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    const restaurantId = item.restaurantId;

    // Validate that all required ingredients have enough stock before proceeding
    for (let ingredient of item.ingredients) {
      const inventories = await Inventory.findById(ingredient.ingredientId);
      if (!inventories) {
        return res
          .status(404)
          .json({
            message: `Ingredient ${ingredient.ingredientId} not found.`,
          });
      }

      const requiredQuantity = quantity * ingredient.amountUsedPerItem;
      if (inventories.availableQuantity < requiredQuantity) {
        // If any ingredient is insufficient, mark the item as unavailable and prevent the order
        item.isAvailable = false;
        await item.save();
        return res.status(400).json({
          message:
            "The item you want to order is not available. Please choose another item or wait until it becomes available.",
        });
      }
    }

    // Deduct required quantity from each ingredient's available stock
    for (let ingredient of item.ingredients) {
      const inventories = await Inventory.findById(ingredient.ingredientId);
      if (inventories) {
        inventories.availableQuantity -=
          quantity * ingredient.amountUsedPerItem;
        await inventories.save();
      }
    }

    // Place the order since all ingredients are available
    const order = new Order({
      orderedBy: [
        {
          userId,
          name,
          phone,
          tableNumber,
          quantity,
          totalPrice,
        },
      ],
      inventory: item.ingredients.map((ingredient) => ({
        ingredientId: ingredient.ingredientId,
      })),
      menuItemId: itemId,
      restaurantId,
    });

    await order.save();
    res.status(200).json({ message: "Order placed successfully.", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to place the order.", error });
  }
};

//Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    // const order = await Order.findOnde ({orderedBy._id: orderId});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to cancel this order." });
  }
};
//Pay for placed Order
export const payForOder = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to initiate Payment.", error });
  }
};
