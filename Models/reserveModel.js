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
    },
    reservationEndTime: {
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
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
      required: true
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
