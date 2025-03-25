import mongoose from "mongoose";
import cookie from "cookie-parser";
import jwt, { verify } from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(404).json({ Message: "Headers is required." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "token not foun in cookie" });
  }

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, decoded) => {
      if (err) {
        if (err.name == "TokenExpiredError") {
          res
            .status(401)
            .json({ message: "Token has expired, please log in again." });
        }
        res.status(303).json({ message: "Invalid token" });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to verify the user." });
  }
};

export const checkAdminRole = async (req, res, next) => {
  try {
    if (req.user.role === "Admin") {
      next();
    }
    res.status(403).json({ message: "Access denied" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid credentail." });
  }
};
