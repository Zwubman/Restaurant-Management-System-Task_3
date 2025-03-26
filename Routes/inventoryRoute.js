import mongoose from "mongoose";
import express from "express";
import {
  addInventory,
  updateInventoryById,
  getAllIngredient,
  getIngredientById,
  deleteIngredientById,
} from "../Controllers/inventoryController.js";

const router = express.Router();

router.post("/add-ingredient/:id", addInventory);
router.put("/update-ingredient/:id", updateInventoryById);
router.get("/all-ingredients", getAllIngredient);
router.get("/one-ingredient/:id", getIngredientById);
router.delete("/delete-ingredient/:id", deleteIngredientById);

export default router;
