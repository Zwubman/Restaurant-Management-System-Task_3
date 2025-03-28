import mongoose from "mongoose";
import Reserve from "../Models/reserveModel.js";
import Restaurant from "../Models/restaurantModel.js";

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
export const reservation = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      tableNumber,
      reservationStartDateTime,
      reservationEndDateTime,
    } = req.body;

    const userId = req.user._id;
    const newStatus = "Pending";

    const reservation = await Reserve.findOne({ tableNumber: tableNumber });

    if (!reservation) {
      return res.status(404).json({ message: "Reserve not found." });
    }

    if (reservation.reservationStatus !== "Available") {
      return res
        .status(303)
        .json({
          message:
            "Reservation is not available, please reserve an other available reservation.",
        });
    }

    reservation.customerName = customerName;
    reservation.customerPhoe = customerPhone;
    reservation.reservationStartDateTime = reservationStartDateTime;
    reservation.reservationEndDateTime = reservationEndDateTime;
    reservation.reservationStatus = newStatus;

    reservation.reservedBy.push({
      userId,
    });

    await reservation.save();

    res.status(200).json({
      message: `Reserve table number ${tableNumber} successfully booked.`,
      reservation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to booking these table.", error });
  }
};

export const payForReservation = async (req, res) => {
  try{

  }catch(error){
    console.log(error);
    res.status(500).json({message: "Failed to initialize the payment.", error});
  }
};
