import mongoose from "mongoose";
import express from "express";
import { registerNewEmployee } from "../Controllers/userController.js";

const router = express.Router();

router.post("/register-employee", registerNewEmployee);


export default router;