import mongoose, { mongo } from "mongoose";

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
    reservationStartDateTime: {
      type: Date,
    },
    reservationEndDateTime: {
      type: Date,
    },
    guestCount: {
      type: Number,
      min: 1,
    },
    customerName: {
      type: String,
    },
    customerPhone: {
      type: String,
    },
    prepaymentAmount: {
      type: Number,
      required: true,
      default: 5,
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
    },
    reservedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
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
