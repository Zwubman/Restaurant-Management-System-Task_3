import mongoose, { mongo } from "mongoose";
import { v4 as uuidv4 } from "uuid";


const reserveSchema = mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
    },
    reservationStatus: {
      type: String,
      enum: ["Available", "Pending", "Confirmed", "Canceled", "Completed"],
      default: "Available",
      required: true,
    },
    guestCount: {
      type: Number,
      min: 1,
    },
    prepaymentAmount: {
      type: Number,
      required: true,
      default: 500,
    },
    payment: {
      method: {
        type: String,
        enum: ["Telebirr", "CBE"],
      },
      paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
      },
      amountPaid: {
        type: Number,
      },
      transactionId: {
        type: String,
      },
      tx_ref: { 
        type: String, 
        unique: true, 
        default: function () {
            return `reserve-${uuidv4()}`;
        }
    }
    },
    reservedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        customerName: {
          type: String,
        },
        customerPhone: {
          type: String,
        },
        reservationStartDateTime: {
          type: Date,
        },
        reservationEndDateTime: {
          type: Date,
        },
      },
    ],
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
  },
  { timestamps: true }
);

reserveSchema.index(
  { tableNumber: 1, reservationDateTime: 1 },
  { unique: true }
);

const Reserve = mongoose.model("Reserve", reserveSchema);
export default Reserve;
