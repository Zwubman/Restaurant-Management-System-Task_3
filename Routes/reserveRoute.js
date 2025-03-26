import mongoose from "mongoose";
import express from "express";
import { createReservationTable } from "../Controllers/reserveController.js";


const router = express.Router();

router.post("/create-reserve", createReservationTable);


export default router;