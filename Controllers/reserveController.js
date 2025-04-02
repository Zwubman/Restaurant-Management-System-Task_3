import mongoose from "mongoose";
import Reserve from "../Models/reserveModel.js";
import Restaurant from "../Models/restaurantModel.js";
import User from "../Models/userModel.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import {
  sendReservationEmail,
  sendMailcancelReservation,
} from "../Helpers/sendMail.js";

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

    const reservation = await Reserve.findOne({ tableNumber: tableNumber });

    if (reservation) {
      return res
        .status(303)
        .json({ message: "Table reservation is already created." });
    }

    const tx_ref = `reserve-${uuidv4()}`;
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

    const reservation = await Reserve.findOne({
      tableNumber: tableNumber,
    }).populate("restaurantId");

    const user = await User.findOne({ _id: userId });

    if (!reservation) {
      return res.status(404).json({ message: "Reserve not found." });
    }

    const restaurantName = reservation.restaurantId.restaurantName;
    const reservationAmount = `${reservation.prepaymentAmount} ${reservation.restaurantId.currency}`;

    // Convert entered reservation time to a Date object
    const enteredTime = new Date(reservationStartDateTime);

    // Ensure reservation.reservedBy exists and is an array
    if (!Array.isArray(reservation.reservedBy)) {
      reservation.reservedBy = [];
    }
    const tx_ref = `reserve-${uuidv4()}`;
    // Loop through reservedBy array to check all reservations
    for (const reserved of reservation.reservedBy) {
      const startTime = new Date(reserved.reservationStartDateTime);
      const endTime = new Date(reserved.reservationEndDateTime);
      const reservationStatus = reserved.reservationStatus;

      if (!reserved.tx_ref || reserved.tx_ref === null) {
        reserved.tx_ref = `reserve-${uuidv4()}`;
      }

      if (
        reservationStatus === "Confirmed" &&
        enteredTime >= startTime &&
        enteredTime <= endTime
      ) {
        return res.status(303).json({
          message:
            "Reservation at this time is already reserved, please reserve it for another time.",
        });
      }
    }

    //To extract only date in the foramt of "2025-03-29"
    const dateTime1 = new Date(reservationStartDateTime);
    const dateTime2 = new Date(reservationEndDateTime);
    const startDate = dateTime1.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const endDate = dateTime2.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    //To extract only hours and minutes to send it in email
    const startHours = String(dateTime1.getUTCHours()).padStart(2, "0");
    const startMinute = String(dateTime1.getUTCMinutes()).padStart(2, "0");
    const endHours = String(dateTime2.getUTCHours()).padStart(2, "0");
    const endMinute = String(dateTime2.getUTCMinutes()).padStart(2, "0");

    const amPm1 = startHours >= 12 ? "PM" : "AM";
    const amPm2 = endHours >= 12 ? "PM" : "AM";

    const startTime = `${startHours}:${startMinute} ${amPm1}`;
    const endTime = `${endHours}:${endMinute} ${amPm2}`;

    reservation.reservedBy.push({
      userId,
      customerName,
      customerPhone,
      reservationStartDateTime,
      reservationEndDateTime,
      tx_ref: tx_ref,
    });

    user.myReservation.push(reservation._id);

    await reservation.save();
    await user.save();

    await sendReservationEmail(
      userEmail,
      tableNumber,
      restaurantName,
      customerName,
      startDate,
      startTime,
      endDate,
      endTime,
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
export const cancelBookedReservation = async (req, res) => {
  try {
    const { tableNumber } = req.body;

    const userId = req.user._id;
    const userEmail = req.user.email;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User to cancel reservation not foun" });
    }

    const reservation = await Reserve.findOne({
      tableNumber: tableNumber,
    }).populate("restaurantId");

    if (!reservation) {
      return res
        .status(404)
        .json({ message: "Reservation you want to cancel is not found." });
    }

    const canceledReservation = reservation.reservedBy.find(
      (exUser) => exUser.userId.toString() === userId.toString()
    );

    if (!canceledReservation) {
      return res.status(404).json({
        message: "Reservation has not booked by this user.",
      });
    }
    canceledReservation.reservationStatus = "Canceled";

    const customerName = canceledReservation.customerName;
    const restaurantName = reservation.restaurantId.restaurantName;
    console.log(restaurantName);

    //To extract only date in the foramt of "2025-03-29"
    const dateTime1 = new Date(canceledReservation.reservationStartDateTime);
    const dateTime2 = new Date(canceledReservation.reservationEndDateTime);
    const startDate = dateTime1.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const endDate = dateTime2.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    //To extract only hours and minutes to send it in email
    const startHours = String(dateTime1.getUTCHours()).padStart(2, "0");
    const startMinute = String(dateTime1.getUTCMinutes()).padStart(2, "0");
    const endHours = String(dateTime2.getUTCHours()).padStart(2, "0");
    const endMinute = String(dateTime2.getUTCMinutes()).padStart(2, "0");

    const amPm1 = startHours >= 12 ? "PM" : "AM";
    const amPm2 = endHours >= 12 ? "PM" : "AM";

    const startTime = `${startHours}:${startMinute} ${amPm1}`;
    const endTime = `${endHours}:${endMinute} ${amPm2}`;

    await reservation.save();

    sendMailcancelReservation(
      userEmail,
      restaurantName,
      tableNumber,
      customerName,
      startDate,
      startTime,
      endDate,
      endTime
    );

    res.status(200).json({ message: "Reservation is canceled successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to cancel the reservation.", error });
  }
};

//Get my reservation
export const getMyReservation = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findOne(userId).populate("myOrders");

    if (!user) {
      return res
        .status(404)
        .json({ message: "User trying to get my order is not found" });
    }

    const foundReservations = [];

    for (let reservations of user.myReservation) {
      const reservationId = reservations;
      console.log(reservationId);

      const reservation = await Reserve.findOne({ _id: reservationId })
        .populate({
          path: "restaurantId",
          select:
            "restaurantName restaurantEmail restaurantPhone restaurantAddress",
        })
        .select(
          "tableNumber reservedBy.customerName reservedBy.customerPhone " +
            "reservedBy.reservationStartDateTime reservedBy.reservationEndDateTime " +
            "reservedBy.reservationStatus reservedBy.paymentStatus " +
            "reservedBy.paymentMethod reservedBy.amountPaid"
        );

      if (!reservation) {
        console.log(
          `Reservation with ID ${reservationId} not found. Skipping...`
        );
        continue;
      }
      foundReservations.push(reservation);
    }

    if (foundReservations.length > 0) {
      return res
        .status(200)
        .json({ message: "My Reservations", reservations: foundReservations });
    } else {
      return res.status(404).json({ message: "No reservation is found." });
    }
  } catch (error) {
    console.log(error),
      res
        .status(500)
        .json({ message: "Fail to access my reservation.", error });
  }
};

// Pay for the reservation
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

    const reserve = reservation.reservedBy.find(
      (exUser) => exUser.userId.toString() === userId.toString()
    );
    const tx_ref = reserve.tx_ref;

    for (let reserved of reservation.reservedBy) {
      if (reserved.reservationStatus !== "Pending") {
        return res
          .status(400)
          .json({ message: "This reservation is not in  payable state." });
      }
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
      callback_url: `http://localhost:4444/reserve/callback?tx_ref=${encodeURIComponent(
        tx_ref
      )}`,
      return_url: `http://localhost:5173/payment-success?reservationId=${encodeURIComponent(
        reservation._id
      )}&tx_ref=${encodeURIComponent(tx_ref)}`,
      customization: {
        title: "Table Payment",
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

    // const updatedreservation = await Reserve.findOneAndUpdate(
    //   {
    //     "reservedBy.tx_ref": tx_ref,
    //   },
    //   {
    //     $set: {
    //       "reservedBy.$.paymentMethod": paymentMethod,
    //     },
    //   },
    //   {
    //     new: true,
    //   }
    // );

    //update the payment method of the order
    const updatedReserve = reservation.reservedBy.find(
      (isEX) => isEX.tx_ref.toString() === tx_ref.toString()
    );

    if (updatedReserve) {
      updatedReserve.paymentMethod = paymentMethod;
      await reservation.save();
      console.log(updatedReserve.paymentMethod);
    } else {
      console.log("No matching reservation found for tx_ref:", tx_ref);
    }

    res.status(200).json({
      message: "Payment initialized successfully.",
      tx_ref: tx_ref,
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

// Handle payment callback
export const paymentCallback = async (req, res) => {
  const tx_ref = req.query.tx_ref;

  console.log("Raw Callback Query Params:", req.query);

  if (!tx_ref) {
    return res
      .status(400)
      .json({ message: "tx_ref is required in query parameters." });
  }

  try {
    // Verify the payment status from Chapa
    const chapaResponse = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );

    const chapaData = chapaResponse.data;

    if (!chapaData || chapaData.status !== "success") {
      return res.status(400).json({
        message: "Failed to verify payment status.",
        chapaData,
      });
    }

    const actualStatus = chapaData.data.status;
    const transactionReference = chapaData.data.tx_ref;
    console.log("Verified Payment Status from Chapa:", actualStatus);

    // Find reservation using tx_ref
    const reservation = await Reserve.findOne({
      "reservedBy.tx_ref": tx_ref,
    }).populate("restaurantId");

    const currency = reservation.restaurantId.currency;
    const amountPaid = `${reservation.prepaymentAmount} ${currency}`;

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    // Update reservation status based on actual payment status
    if (actualStatus === "success") {
      const reservation = await Reserve.findOneAndUpdate(
        {
          "reservedBy.tx_ref": tx_ref,
        },
        {
          $set: {
            "reservedBy.$.paymentStatus": "Paid",
            "reservedBy.$.reservationStatus": "Confirmed",
            "reservedBy.$.transactionId": transactionReference,
            "reservedBy.$.amountPaid": amountPaid,
            "reservedBy.$.tx_ref": tx_ref,
            "reservedBy.$.paymentDate": new Date(),
          },
        },
        {
          new: true,
        }
      );
    } else {
      const reservation = await Reserve.findOneAndUpdate(
        {
          "reservedBy.tx_ref": tx_ref,
        },
        {
          $set: {
            "reservedBy.$.paymentStatus": "Failed",
            "reservedBy.$.reservationStatus": "Pending",
            "reservedBy.$.transactionId": chapaResponse.data.data.tx_ref,
            "reservedBy.$.amountPaid": 0,
            "reservedBy.$.tx_ref": tx_ref,
            "reservedBy.$.paymentDate": new Date(),
          },
        }
      );
    }

    // Redirect user to frontend with actual status
    const redirectUrl = `http://localhost:5173/payment-success?reservationId=${reservation._id}
    &tx_ref=${tx_ref}&status=${actualStatus}`;
    res.status(200).json({
      message: "Redirecting to the success page",
      redirectUrl: redirectUrl,
    });
  } catch (error) {
    console.error("Error verifying payment with Chapa:", error);
    res.status(500).json({ message: "Server error verifying payment." });
  }
};

//Update reservation by different reason
export const updateReservation = async (req, res) => {
  try {
    const { reservationStatus, amountPaid, paymentStatus, transactionId } =
      req.body;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        "Fail to updating reservation after payment by defferent reason.",
      error,
    });
  }
};
