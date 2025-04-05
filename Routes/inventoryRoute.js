import mongoose from "mongoose";
import express from "express";
import {
  addInventory,
  updateIngredientById,
  getAllIngredient,
  getIngredientById,
  deleteIngredientById,
  suplieIngredeints
} from "../Controllers/inventoryController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add-ingredient/:id", addInventory);
router.put("/update-ingredient/:id", updateIngredientById);
router.get("/all-ingredients", getAllIngredient);
router.get("/one-ingredient/:id", getIngredientById);
router.delete("/delete-ingredient/:id", deleteIngredientById);
router.post("/suplie/:id", verifyToken,  suplieIngredeints);

export default router;
