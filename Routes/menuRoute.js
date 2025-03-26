import mongoose from "mongoose";
import express from "express";
import { addMenuItem, updateMenuItem } from "../Controllers/menuController.js";

const router = express.Router();

router.post("/add-item/:id", addMenuItem);
router.put("/update-item", updateMenuItem);


export default router;