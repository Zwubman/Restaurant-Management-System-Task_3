import mongoose from "mongoose";
import express from "express";
import {
  placeOrder,
  cancelOrder,
  payForOrder,
  paymentCallback,
  getAllOrderPerItem,
  getAllOrder
} from "../Controllers/orderController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/place-order/:id", verifyToken, placeOrder);
router.post("/cancel-order/:id", verifyToken, cancelOrder);
router.post("/order-payment", verifyToken,  payForOrder);
router.get("/callback", paymentCallback);
router.get("/orders-per-item", verifyToken, getAllOrderPerItem);
router.get("/all-orders", verifyToken,  getAllOrder);

export default router;
