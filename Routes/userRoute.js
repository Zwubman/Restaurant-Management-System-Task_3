import mongoose from "mongoose";
import express from "express";
import { registerNewEmployee, updatePassword, getAllEmployee, getEmployeeById } from "../Controllers/userController.js";
import { verifyToken, checkAdminRole } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register-employee", verifyToken, registerNewEmployee);
router.put("/update-password/:id", verifyToken,  updatePassword);
router.get("/all-employee", verifyToken,  getAllEmployee);
router.get("/employee/:id", getEmployeeById);


export default router;