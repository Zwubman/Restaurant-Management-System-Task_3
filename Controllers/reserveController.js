import mongoose from "mongoose";
import Reserve from "../Models/reserveModel.js";
import Restaurant from "../Models/restaurantModel.js";
import { sendReservationEmail } from "../Helpers/sendMail.js";
import User from "../Models/userModel.js";
import request from "request";
import { v4 as uuidv4 } from "uuid";


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

    const isBooked = reservation.reservedBy.some((exUser) => 
      exUser.userId.toString() === userId.toString()
    );
    
    const hasReservation = user.myReservation.some((hasRes) => 
      hasRes.toString() === reservation._id.toString()
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
const CHAPA_SECRET_KEY = "CHASECK_TEST-MPcWpsCChAd8rgJ3DpfGxiYTlWqWrWdI";
const CALLBACK_URL = "http://localhost:4444/api/payment/callback"; // Change this if you deploy

export const payForReservation = async (req, res) => {
  try {
    const { reservationId } = req.body;

    const reservation = await Reserve.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Generate unique transaction reference
    const tx_ref = `reserve-${uuidv4()}`;

    // Save tx_ref in the database
    reservation.payment.tx_ref = tx_ref;
    await reservation.save();

    // Prepare request options
    const options = {
      method: "POST",
      url: "https://api.chapa.co/v1/transaction/initialize",
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: reservation.prepaymentAmount,
        currency: "ETB",
        email: "customer@example.com", // Use the customer's email if available
        first_name: reservation.customerName.split(" ")[0] || "Guest",
        last_name: reservation.customerName.split(" ")[1] || "User",
        phone_number: reservation.customerPhone,
        tx_ref: tx_ref,
        callback_url: CALLBACK_URL,
        return_url: "http://localhost:4444/payment/success",
        "customization[title]": "Table Reservation Payment",
        "customization[description]": `Payment for table ${reservation.tableNumber}`,
      }),
    };

    request(options, (error, response, body) => {
      if (error) {
        return res.status(500).json({ message: "Payment initialization failed", error });
      }
      const data = JSON.parse(body);
      if (data.status !== "success") {
        return res.status(400).json({ message: "Failed to initiate payment", data });
      }
      return res.status(200).json({ message: "Payment initiated", data: data.data });
    });
  } catch (error) {
    res.status(500).json({ message: "Error processing payment", error });
  }
};

