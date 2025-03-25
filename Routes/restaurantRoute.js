import mongoose from "mongoose";
import express from "express";
import { registerRestaurant } from "../Controllers/restaurantController.js";


const router = express.Router();

router.post("/register-restaurant", registerRestaurant);


export default router;