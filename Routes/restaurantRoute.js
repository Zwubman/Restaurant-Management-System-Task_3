import mongoose from "mongoose";
import express from "express";
import { registerRestaurant, restaurantLogIn, updateRestaurant } from "../Controllers/restaurantController.js";


const router = express.Router();

router.post("/register-restaurant", registerRestaurant);
router.post("/restaurant-login", restaurantLogIn);
router.put("/update-restaurant", updateRestaurant);


export default router;