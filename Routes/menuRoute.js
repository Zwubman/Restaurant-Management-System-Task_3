import mongoose from "mongoose";
import express from "express";
import { addMenuItem, updateMenuItem, addIngredientsToItem } from "../Controllers/menuController.js";

const router = express.Router();

router.post("/add-item/:id", addMenuItem);
router.put("/update-item/:id", updateMenuItem);
router.post("/add-ingredients/:id", addIngredientsToItem)


export default router;