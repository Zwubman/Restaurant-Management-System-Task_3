import mongoose from "mongoose";
import Reserve from "../Models/reserveModel.js";
import Restaurant from "../Models/restaurantModel.js";
import { sendReservationEmail } from "../Helpers/sendMail.js";
import User from "../Models/userModel.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

//To Create reservation table
export const createReservationTable = async (req, res) => {
  try {
    const { tableNumber } = req.body;
    const restaurantId = req.params.id;

    const restaurant = await Restaurant.findOne({ _id: restaurantId });
    if (!restaurant) {
      return res.status(404).json({
        message:
          "Restaurant not found in which the reservation table is created to.",
      });
    }

    const isCreated = await Reserve.findOne({ tableNumber: tableNumber });

    if (isCreated) {
      return res
        .status(303)
        .json({ message: "Table reservation is already created." });
    }

    const table = await new Reserve({
      tableNumber,
      restaurantId: restaurantId,
    });

    await table.save();

    res
      .status(200)
      .json({ message: "Table reservation created successfull.", table });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Fail to create Reservation table.", error });
  }
};

//Delete reserve table
export const deleteReserveTable = async (req, res) => {
  try {
    const { tableNumber } = req.body;

    const deletedTable = await Reserve.findOneAndDelete({
      tableNumber: tableNumber,
    });

    if (!deletedTable) {
      return res
        .status(404)
        .json({ message: "Reserve table not found and not deleted." });
    }

    res.status(200).json({ message: "Reserve tabel deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to delete reserve table.", error });
  }
};

// User can book reservation
export const bookReservation = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      tableNumber,
      reservationStartDateTime,
      reservationEndDateTime,
    } = req.body;

    const userId = req.user._id;
    const userEmail = req.user.email;
    const newStatus = "Pending";

    const reservation = await Reserve.findOne({
      tableNumber: tableNumber,
    }).populate("restaurantId");

    const user = await User.findOne({ _id: userId });

    const restaurantName = reservation.restaurantId.restaurantName;
    const reservationAmount = `${reservation.prepaymentAmount} ETB`;

    if (!reservation) {
      return res.status(404).json({ message: "Reserve not found." });
    }

    if (reservation.reservationStatus !== "Available") {
      return res.status(303).json({
        message:
          "Reservation is not available, please reserve an other available reservation.",
      });
    }

    if (reservation.payment.tx_ref === null) {
      // Generate a unique transaction reference
      const tx_ref = `reserve-${uuidv4()}`;
      reservation.payment.tx_ref = tx_ref;
    }

    reservation.reservationStatus = newStatus;

    reservation.reservedBy.push({
      userId,
      customerName,
      customerPhone,
      reservationStartDateTime,
      reservationEndDateTime,
    });

    user.myReservation.push(reservation._id);

    await reservation.save();
    await user.save();

    await sendReservationEmail(
      userEmail,
      reservation.tableNumber,
      restaurantName,
      reservation.customerName,
      reservation.reservationStartDateTime,
      reservation.reservationEndDateTime,
      reservationAmount
    );

    res.status(200).json({
      message: `Reserve table number ${tableNumber} successfully booked.`,
      reservation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to booking these table.", error });
  }
};

//Cancel to booked reservation
export const cancelReservation = async (req, res) => {
  try {
    const { tableNumber } = req.body;

    const newStatus = "Available";
    const userId = req.user._id;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User to cancel reservation not foun" });
    }

    const reservation = await Reserve.findOne({ tableNumber: tableNumber });

    if (!reservation) {
      return res
        .status(404)
        .json({ message: "Reservation you want to cancel is not found." });
    }

    const isBooked = reservation.reservedBy.some(
      (exUser) => exUser.userId.toString() === userId.toString()
    );

    const hasReservation = user.myReservation.some(
      (hasRes) => hasRes.toString() === reservation._id.toString()
    );

    if (!isBooked) {
      return res.status(404).json({
        message: "Reservation has not booked by this user.",
      });
    }

    if (!hasReservation) {
      return res.status(404).json({
        message: `User has not reservation of table number ${tableNumber} table.`,
      });
    }

    reservation.reservationStatus = newStatus;
    reservation.reservedBy = await reservation.reservedBy.filter((resUser) => {
      resUser.userId.toString() !== userId.toString();
    });

    user.myReservation = await user.myReservation.filter((resId) => {
      resId.toString() !== reservation._id.toString();
    });

    await reservation.save();
    await user.save();

    res.status(200).json({ message: "Reservation is canceled successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to cancel the reservation.", error });
  }
};


//Pay for the reservation
export const payForReservation = async (req, res) => {
  try {
    const { tableNumber, paymentMethod } = req.body;
    const userId = req.user._id;

    // Find reservation
    const reservation = await Reserve.findOne({
      tableNumber,
      "reservedBy.userId": userId,
    });

    if (!reservation) {
      return res
        .status(404)
        .json({ message: "Reservation not found or not booked by this user." });
    }

    if (reservation.reservationStatus !== "Pending") {
      return res
        .status(400)
        .json({ message: "This reservation is not in a payable state." });
    }

    // Get user info
    const user = await User.findById(userId);
    const customer = reservation.reservedBy.find(
      (r) => r.userId.toString() === userId.toString()
    );

    if (!customer) {
      return res
        .status(404)
        .json({ message: "Reservation customer not found." });
    }

    // Ensure tx_ref is assigned
    let tx_ref = reservation.payment?.tx_ref;
    if (!tx_ref) {
      tx_ref = `reserve-${uuidv4()}`;
      reservation.payment = {
        ...reservation.payment,
        tx_ref,
      };
      await reservation.save(); // Save tx_ref in DB
    }

    // Fix phone number format (Remove `+`)
    const phone_number = customer.customerPhone.replace("+", "");

    // Payment details
    const paymentData = {
      amount: parseFloat(reservation.prepaymentAmount),
      currency: "ETB",
      email: user.email,
      first_name: customer.customerName.split(" ")[0] || "Guest",
      last_name: customer.customerName.split(" ")[1] || "User",
      phone_number: phone_number,
      tx_ref: tx_ref,
      callback_url: `http://localhost:4444/reserve/callback?tx_ref=${tx_ref}`,
      return_url: `http://localhost:5173/payment-success?reservationId=${reservation._id}`,
      customization: {
        title: "Table Payment", // ✅ Fixed (shortened)
        description: `Payment for table ${reservation.tableNumber}`,
        backgroundColor: "#0000FF",
        buttonColor: "blue",
      },
    };

    // Initialize Payment with Chapa
    const chapaResponse = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (chapaResponse.data.status !== "success") {
      return res.status(500).json({
        message: "Payment initialization failed",
        details: chapaResponse.data,
      });
    }

    // Store payment details in reservation
    reservation.payment = {
      method: paymentMethod,
      paymentStatus: "Pending",
      transactionId: chapaResponse.data.data.tx_ref,
      amountPaid: reservation.prepaymentAmount,
      tx_ref: tx_ref,
    };

    await reservation.save();

    res.status(200).json({
      message: "Payment initialized successfully.",
      payment_url: chapaResponse.data.data.checkout_url,
    });
  } catch (error) {
    console.error("Chapa API Error:", error.response?.data || error);
    return res.status(500).json({
      message: "Failed to process payment.",
      chapaError: error.response?.data || error,
    });
  }
};


//To callback the payment data
export const paymentCallback = async (req, res) => {
  const { tx_ref, status } = req.query;
  console.log("Callback received: ", { tx_ref, status });

  try {
    const reservation = await Reserve.findOne({
      "payment.transactionId": tx_ref,
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    if (status === "success") {
      reservation.payment.paymentStatus = "Paid";
      reservation.reservationStatus = "Confirmed";
    } else {
      reservation.payment.paymentStatus = "Failed";
      reservation.reservationStatus = "Pending";
    }

    await reservation.save();

    // Redirect to frontend payment success/failure page
    const redirectUrl = `http://localhost:5173/payment-success?reservationId=${reservation._id}&status=${status}`;
    console.log("Redirecting to:", redirectUrl); // Check if URL is correct
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error handling payment callback:", error);
    res.status(500).json({ message: "Server error" });
  }
};
