import mongoose from "mongoose";
import { stringify } from "uuid";

const orderSchema = mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
    required: true,
  },
  orderedBy: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      tableNumber: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      totalPrice: {
        type: Number,
        required: true,
      },
      orderStatus: {
        type: String,
        enum: ["Pending", "Inprogress", "Completed", "Canceled"],
        default: "Pending",
        required: true,
      },
      orderDateTime: {
        type: Date,
        default: Date.now,
        required: true,
      },
      payment: {
        method: {
          type: String,
          enum: ["Telebirr", "CBE"], 
        },
        paymentStatus: {
          type: String,
          enum: ["Pending", "Paid", "Failed"],
          default: "Pending",
        },
        amountPaid: {
          type: Number,
          default: 0,
          required: true,
        },
        transactionId: {
          type: String,
        },
      },
    },
  ],
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  inventory: [
    {
      ingredientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory",
        required: true,
      },
    },
  ],
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
