import mongoose from "mongoose";
import express from "express";
import { addInventory, updateInventoryById, getAllIngredient } from "../Controllers/inventoryController.js";

const router = express.Router();

router.post("/add-ingredient/:id", addInventory);
router.put("/update-ingredient/:id", updateInventoryById);
router.get("/all-ingredients", getAllIngredient);

export default router;