import mongoose from "mongoose";
import express from "express";
import { addInventory } from "../Controllers/inventoryController.js";

const router = express.Router();

router.post("/add-ingredient", addInventory);

export default router;