import mongoose from "mongoose";
import express from "express";
import { createReservationTable, reservation } from "../Controllers/reserveController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";


const router = express.Router();

router.post("/create-reserve/:id", createReservationTable);
router.post("/reservation", verifyToken, reservation);


export default router;