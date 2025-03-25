import mongoose from "mongoose";
import express from "express";
import { registerRestaurant, restaurantLogIn } from "../Controllers/restaurantController.js";


const router = express.Router();

router.post("/register-restaurant", registerRestaurant);
router.post("/restaurant-login", restaurantLogIn);


export default router;