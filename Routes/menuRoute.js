import mongoose from "mongoose";
import express from "express";
import { addMenuItem } from "../Controllers/menuController.js";

const router = express.Router();

router.post("/add-item", addMenuItem);


export default router;