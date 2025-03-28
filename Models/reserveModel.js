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
      default: 50,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending"],
    },
    reservedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
  },
  { timestamps: true }
);

// Apply the status transition middleware
reserveSchema.pre("save", enforceReservationStatusTransitions);

reserveSchema.index(
  { tableNumber: 1, reservationDateTime: 1 },
  { unique: true }
);

const Reserve = mongoose.model("Reserve", reserveSchema);
export default Reserve;
