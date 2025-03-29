import mongoose from "mongoose";
import express from "express";
import {
  createReservationTable,
  bookReservation,
  cancelReservation,
  deleteReserveTable,
  payForReservation,
  paymentCallback
} from "../Controllers/reserveController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-reserve/:id", createReservationTable);
router.delete("/delete-reservation", deleteReserveTable);
router.post("/reservation", verifyToken, bookReservation);
router.post("/cancel-reservation", verifyToken, cancelReservation);
router.post("/pay", verifyToken,  payForReservation);
router.get("/callback", paymentCallback);

export default router;
