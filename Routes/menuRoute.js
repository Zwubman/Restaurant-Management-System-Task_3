import mongoose from "mongoose";
import express from "express";
import {
  addMenuItem,
  updateMenuItem,
  addIngredientsToItem,
  removeIngredeintFromItem,
  deleteMenuItemById,
  makeAvailableItem,
  getAllMenuItem
} from "../Controllers/menuController.js";

const router = express.Router();

router.post("/add-item/:id", addMenuItem);
router.post("/add-ingredients/:id", addIngredientsToItem);
router.delete("/remove-ingredient/:id", removeIngredeintFromItem);
router.delete("/delete-item/:id", deleteMenuItemById);
router.put("/make-available/:id", makeAvailableItem);
router.put("/update-item/:id", updateMenuItem);
router.get("/all-items", getAllMenuItem);


export default router;
