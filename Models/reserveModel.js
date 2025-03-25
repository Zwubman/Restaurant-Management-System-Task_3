import mongoose, { mongo } from "mongoose";

const reserveSchema = mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
    },
    reservationStatus: {
      type: String,
      enum: ["Confirmed", "Canceled", "Completed", "Available"],
      default: "Available",
      required: true,
    },
    reservationDateTime: {
      type: Date,
      required: true,
    },
    reservationEndTime: {
      type: Date,
      required: true,
    },
    guestCount: {
      type: Number,
      required: true,
      min: 1,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
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
      required: true
    }
  },
  { timestamps: true }
);

reserveSchema.index(
  { tableNumber: 1, reservationDateTime: 1 },
  { unique: true }
);

const Reserve = mongoose.model("Reserve", reserveSchema);
export default Reserve;
