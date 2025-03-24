import mongoose from "mongoose";
import express from "express";
import { signUp } from "../Controllers/authController.js";

const router = express.Router();


router.post("/sign-up", signUp);

export default router;