import mongoose from "mongoose";
import express from "express";
import { registerNewEmployee, updatePassword } from "../Controllers/userController.js";

const router = express.Router();

router.post("/register-employee", registerNewEmployee);
router.put("/update-password/:id", updatePassword)


export default router;