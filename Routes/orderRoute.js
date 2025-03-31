import mongoose from "mongoose";
import express from "express";
import { placeOrder } from "../Controllers/orderController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/place-order/:id", verifyToken, placeOrder);



export default router;