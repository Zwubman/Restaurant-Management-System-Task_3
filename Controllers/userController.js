import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../Models/userModel.js";

//Register new Employee
export const registerNewEmployee = async (req, res) => {
  try {
    const { firstName, middleName, lastName, phone, email, role } = req.body;
    const isExist = await User.findOne({email: email});

    if(!isExist){
        return res.status(400).json({message: "Employe has already registered."});
    }
    
    //set a default password for all registered employee
    const password = `${firstName}@1234`;
    console.log(password);
    const hashedPassword = bcrypt.hash(password, 10);


    const employee = new User({
        firstName,
        middleName,
        lastName,
        phone,
        role,
        hashedPassword,
    });

    await employee.save();

    res.status(200).json({message: "Employee regisered successfully.", employee});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to register new user." });
  }
};
