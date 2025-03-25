import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../Models/userModel.js";

//Register new Employee
export const registerNewEmployee = async (req, res) => {
  try {
    const {
      email,
      role,
      salary,
      salaryCurrency,
    } = req.body;

    const user = await User.findOne({ email: email });

    if (!salary || !role || !salaryCurrency) {
      return res.status(300).json({
        message: "Employee salary, role and salaryCurrency is required. ",
      });
    }

    if (!user) {
      return res
        .status(400)
        .json({ message: "User has not sign Up." });
    }


    //Register user as new Employee
    const employee = await User.findOneAndUpdate(
        {email: email},
        {$set: req.body},
        {new: true}
    );

    if(!employee){
        return res.status(300).json({message: "User not foun or not registered as Employee"})
    }


    res
      .status(200)
      .json({ message: "User regisered successfully as Employee.", employee });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to register new user.", error });
  }
};

//Update password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user._id
    const user = await user.findOne({userId});
    // const userId = req.params.id
    // const user = await User.findOne({_id: userId});

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(300).json({
        message:
          "Incorrect current password, please enter the correct current password.",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res
        .status(300)
        .json({
          message: "New password don not match, please make similar.",
        });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({message: "Password successfully update."})
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update password.", error });
  }
};
