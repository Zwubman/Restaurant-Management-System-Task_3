import mongoose from "mongoose";
import express from "express";
import { registerNewEmployee, updatePassword } from "../Controllers/userController.js";
import { verifyToken, checkAdminRole } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register-employee", verifyToken, checkAdminRole, registerNewEmployee);
router.put("/update-password/:id", verifyToken,  updatePassword);


export default router;