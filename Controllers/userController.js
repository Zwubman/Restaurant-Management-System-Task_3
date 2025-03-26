import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../Models/userModel.js";
import Restaurant from "../Models/restaurantModel.js";

//Register new Employee
export const registerNewEmployee = async (req, res) => {
  try {
    const { email, role, salary } = req.body;

    const user = await User.findOne({ email: email }).populate("restaurantId");

    const restaurant = user.restaurantId;
    const salaryCurrency = restaurant.currency;

    if (!user) {
      return res.status(400).json({ message: "User has not sign Up." });
    }

    if (!salary || !role) {
      return res.status(300).json({
        message: "Employee salary, role is required. ",
      });
    }

    // Check if there are no changes
    if (user.email == email && user.role == role && user.salary == salary) {
      return res.status(400).json({
        message: "Nothing is changed, please make some changes to update.",
      });
    }

    //Register user as new Employee
    const employee = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          email,
          role,
          salary,
          salaryCurrency,
        },
      },
      { new: true }
    );

    if (!employee) {
      return res
        .status(300)
        .json({ message: "User not found or not registered as Employee" });
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
    const userId = req.user._id;
    const user = await user.findOne({ userId });
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
      return res.status(300).json({
        message: "New password don not match, please make similar.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password successfully update." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update password.", error });
  }
};

//Get all Employee for the company
export const getAllEmployee = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId }).populate(
      "restaurantId",
      "restaurantName"
    );

    const restaurant = user.restaurantId;

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (user.role !== "Customer" && user.salary !== null) {
      return res
        .status(200)
        .json({ message: `Employee for ${restaurant.restaurantName}:`, user });
    }
  } catch (error) {}
};

//Get employee by Id
export const getEmployeeById = async (req, res) => {
  try {
    const userId = req.params.id;

    const employee = await User.findOne({ _id: userId }).select(
      "firstName middleName lastName email phone role salary"
    );
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    if (employee.role == "Customer" && employee.salary == null) {
      return res
        .status(401)
        .json({
          message:
            "You try to found users not employee, please find employee by correct id.",
        });
    }

    res.status(200).json({ message: "Employee found by id:", employee });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get Employee by id." });
  }
};
