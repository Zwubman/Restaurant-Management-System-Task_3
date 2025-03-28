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
export const bookingTable = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      tableNumber,
      reservationStartDateTime,
      reservationEndDateTime,
    } = req.body;

    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to booking these table.", error });
  }
};
