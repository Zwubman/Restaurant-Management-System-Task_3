import mongoose from "mongoose";
import express from "express";
import {
  addMenuItem,
  updateMenuItem,
  addIngredientsToItem,
  removeIngredeintFromItem,
  deleteMenuItemById,
} from "../Controllers/menuController.js";

const router = express.Router();

router.post("/add-item/:id", addMenuItem);
router.put("/update-item/:id", updateMenuItem);
router.post("/add-ingredients/:id", addIngredientsToItem);
router.delete("/remove-ingredient/:id", removeIngredeintFromItem);
router.delete("/delete-item", deleteMenuItemById);

export default router;
