import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
  },
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
  },
  orderStatus: {
    type: String,
    enum: ["Pending", "Inprogress", "Completed", "Canceled"],
    default: "Pending",
    required: true,
  },
  payment: {
    method: {
      type: String,
      enum: ["Telebirr", "CBE"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
      required: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
      required: true,
    },
    transactionId: {
      type: String,
      required: function () {
        return this.payment.method !== "Cash";
      },
    },
  },
  orderDateTime: {
    type: Date,
    default: Date.now,
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory",
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
