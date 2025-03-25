import mongoose  from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import  "./DbConfigs/dbConfig.js"
import Inventory from "./Models/inventoryModel.js";
import Menu from "./Models/menuModel.js";
import Order from "./Models/orderModel.js";
import Reserve from "./Models/reservModel.js";
import User from "./Models/userModel.js";
import authRoute from "./Routes/authRoute.js";
import userRoute from "./Routes/userRoute.js"

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use("/auth", authRoute);
app.use("/users", userRoute);

const port = process.env.PORT;
app.listen(port, ()=> {
    console.log(`Server is running on the port ${port}`);
})