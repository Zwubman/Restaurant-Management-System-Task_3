import mongoose from "mongoose";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Restaurant from "../Models/restaurantModel.js";
import Order from "../Models/orderModel.js";
import User from "../Models/userModel.js";
import Menu from "../Models/menuModel.js";
import Inventory from "../Models/inventoryModel.js";
import Reserve from "../Models/reserveModel.js";
import {
  sendPaymentMailNotification,
  sendOrderEmailNotification,
} from "../Helpers/sendMail.js";

//To order the item from menu
export const placeOrder = async (req, res) => {
  try {
    const { name, phone, tableNumber, quantity, totalPrice } = req.body;
    const itemId = req.params.id;
    const userId = req.user._id;
    const userEmail = req.user.email;

    if (!name || !phone || !tableNumber || !totalPrice) {
      return res.status(303).json({
        message: "Name, Phone, Table number and Total price is required.",
      });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found, please log in and use the token in headers.",
      });
    }

    // Verify the table exists
    const table = await Reserve.findOne({ tableNumber });
    if (!table) {
      return res.status(404).json({ message: "Table not found." });
    }

    // Check if the user has reserved the requested table
    const reservationId = table._id;
    const isValid = user.myReservation.some(
      (isRes) => isRes.toString() === reservationId.toString()
    );

    if (!isValid) {
      return res.status(401).json({
        message:
          "You cannot place an order at this table because it is not reserved under you. Please place your order at your reserved table.",
      });
    }

    const checkTable = await table.reservedBy.some(
      (isValid) => isValid.reservationStatus === "Confirmed"
    );

    if (!checkTable) {
      return res.status(403).json({
        message:
          "You are trying to place the order at the wrong table. Please reserve the table and place an order at your table.",
      });
    }

    // Check if the menu item exists
    const item = await Menu.findById(itemId).populate("restaurantId");
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    // Calculate the expected total price
    const expectedTotalPrice = quantity * item.price;

    // Validate that the entered total price matches the calculated price
    if (totalPrice !== expectedTotalPrice) {
      return res.status(400).json({
        message:
          "The total price entered does not match the expected total price (item price × quantity). Please check and try again.",
      });
    }

    //Extract some order information for email notification
    const restaurantId = item.restaurantId._id;
    const restaurantName = item.restaurantId.restaurantName;
    const menuItemName = item.menuItemName;

    // Validate that all required ingredients have enough stock before proceeding
    for (let ingredient of item.ingredients) {
      const inventories = await Inventory.findById(ingredient.ingredientId);
      if (!inventories) {
        return res.status(404).json({
          message: `Ingredient ${ingredient.ingredientId} not found.`,
        });
      }

      const requiredQuantity = quantity * ingredient.amountUsedPerItem;
      if (inventories.availableQuantity < requiredQuantity) {
        // If any ingredient is insufficient, mark the item as unavailable and prevent the order
        item.isAvailable = false;
        await item.save();
        return res.status(400).json({
          message:
            "The item you want to order is not available. Please choose another item or wait until it becomes available.",
        });
      }
    }

    // Deduct required quantity from each ingredient's available stock
    for (let ingredient of item.ingredients) {
      const inventories = await Inventory.findById(ingredient.ingredientId);
      if (inventories) {
        inventories.availableQuantity -=
          quantity * ingredient.amountUsedPerItem;
        await inventories.save();
      }
    }

    // Place the order since all ingredients are available
    const order = new Order({
      orderedBy: [
        {
          userId,
          name,
          phone,
          tableNumber,
          quantity,
          totalPrice,
          payment: {
            tx_ref: `order-${uuidv4()}`,
          },
        },
      ],
      inventory: item.ingredients.map((ingredient) => ({
        ingredientId: ingredient.ingredientId,
      })),
      menuItemId: itemId,
      restaurantId,
    });

    await order.save();

    // Add the order ID to the user's myOrders array
    user.myOrders.push(order._id);
    await user.save();

    const type = "Placement";
    await sendOrderEmailNotification(
      userEmail,
      restaurantName,
      tableNumber,
      name,
      phone,
      menuItemName,
      quantity,
      type,
      totalPrice,
    );

    res.status(200).json({ message: "Order placed successfully.", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to place the order.", error });
  }
};

//Cancel order before payement
export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const canceledOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        "orderedBy.orderStatus": "Pending",
      },
      {
        $set: { "orderedBy.$.orderStatus": "Canceled" },
      },
      { new: true }
    );

    if (!canceledOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res
      .status(200)
      .json({ message: "Order canceled successfully", canceledOrder });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to cancel this order." });
  }
};

// Update order information before payment
export const updateOrderInfo = async (req, res) => {
  try {
    const { name, quantity, phone, totalPrice } = req.body;
    const userId = req.user._id;
    const orderId = req.params.id;

    // Ensure user is authenticated
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized access. User not found." });
    }

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Ensure the order is not already confirmed or paid
    const orderStatus = order.orderedBy[0]?.orderStatus;
    const paymentStatus = order.orderedBy[0]?.payment?.paymentStatus;

    if (orderStatus === "Confirmed" || paymentStatus === "Paid") {
      return res.status(400).json({
        message: "Order cannot be updated after confirmation or payment.",
      });
    }

    // Retrieve menu item details for price validation
    const menuItem = await Menu.findById(order.menuItemId);
    if (!menuItem) {
      return res
        .status(404)
        .json({ message: "Menu item associated with this order not found." });
    }

    // Validate total price
    const expectedTotalPrice = quantity * menuItem.price;
    if (totalPrice !== expectedTotalPrice) {
      return res.status(400).json({
        message:
          "The total price entered does not match the expected total price (item price × quantity). Please check and try again.",
      });
    }

    // Update the order details
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { name, phone, quantity, totalPrice } },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Order updated successfully.", updatedOrder });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to update order information.", error });
  }
};

// Pay for placed Order
export const payForOrder = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email;

    if (!orderId || !paymentMethod) {
      return res
        .status(303)
        .json({ message: "Order id and payment method is required." });
    }

    // Get user info
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find the order
    const order = await Order.findOne({
      _id: orderId,
      "orderedBy.userId": userId,
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or not ordered by this user." });
    }

    // Find the customer's order entry
    const customerOrder = order.orderedBy.find(
      (order) =>
        order.userId.toString() === userId.toString() &&
        order.orderStatus === "Pending"
    );

    if (!customerOrder) {
      return res.status(404).json({
        message: "Order customer not found or not in a payable state.",
      });
    }

    // Ensure tx_ref is assigned
    let tx_ref = customerOrder.payment?.tx_ref;
    if (!tx_ref) {
      tx_ref = `order-${uuidv4()}`;
      customerOrder.payment.transactionId = tx_ref;
      await order.save(); // Save transaction ID in DB
    }

    // Fix phone number format (Remove `+`)
    const phone_number = customerOrder.phone.replace("+", "");

    // Payment details
    const paymentData = {
      amount: parseFloat(customerOrder.totalPrice),
      currency: "ETB",
      email: user.email,
      first_name: customerOrder.name.split(" ")[0] || "Guest",
      last_name: customerOrder.name.split(" ")[1] || "User",
      phone_number: phone_number,
      tx_ref: tx_ref,
      callback_url: `http://localhost:4444/order/callback?tx_ref=${encodeURIComponent(
        tx_ref
      )}`,
      return_url: `http://localhost:5173/payment-success?orderId=${encodeURIComponent(
        order._id
      )}&tx_ref=${encodeURIComponent(tx_ref)}`,
      customization: {
        title: "Order Payment",
        description: `Payment for order at table ${customerOrder.tableNumber}`,
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

    // Store payment details in the order
    customerOrder.payment.method = paymentMethod;
    await order.save();

    res.status(200).json({
      message: "Payment initialized successfully.",
      tx_ref: tx_ref,
      payment_url: chapaResponse.data.data.checkout_url,
    });
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ message: "Failed to initiate Payment.", error });
  }
};

// Handle payment callback for orders
export const paymentCallback = async (req, res) => {
  const { tx_ref } = req.query; // Get transaction reference from query params

  console.log("Raw Callback Query Params:", req.query);

  if (!tx_ref) {
    return res
      .status(400)
      .json({ message: "tx_ref is required in query parameters." });
  }

  try {
    // Verify payment status with Chapa
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
    console.log("Verified Payment Status from Chapa:", actualStatus);

    // Find the order using tx_ref
    const order = await Order.findOne({
      "orderedBy.payment.tx_ref": tx_ref, // Match transaction ID inside orderedBy
    })
      .populate("restaurantId")
      .populate("menuItemId");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Find the customer's order
    const customerOrder = order.orderedBy.find(
      (order) => order.payment.tx_ref === tx_ref
    );

    if (!customerOrder) {
      return res.status(404).json({
        message: "Customer order not found for this transaction.",
      });
    }

    const userEmail = req.user.email;

    const menuItemName = order.menuItemId.menuItemName;

    console.log(menuItemName);
    if (!menuItemName) {
      return es.status(404).json({ message: "Ordered item not found." });
    }

    // Get currency from restaurant settings (if applicable)
    const currency = order.restaurantId.currency || "ETB";
    const amountPaid = `${customerOrder.totalPrice} ${currency}`;

    // Update order status based on actual payment status
    order.orderedBy.forEach((customerOrder) => {
      if (customerOrder.payment.tx_ref === tx_ref) {
        if (actualStatus === "success") {
          customerOrder.orderStatus = "Confirmed";
          customerOrder.payment.paymentStatus = "Paid";
          (customerOrder.payment.tx_ref = tx_ref),
            (customerOrder.payment.transactionId =
              chapaResponse.data.data.tx_ref),
            (customerOrder.payment.amountPaid = amountPaid),
            (customerOrder.payment.paymentDate = new Date());

          const type = "order";
          // Send Payment Notification
          sendPaymentMailNotification(
            userEmail,
            customerOrder.name,
            order.restaurantId.restaurantName,
            customerOrder.tableNumber,
            amountPaid,
            customerOrder.payment.paymentStatus,
            type,
            customerOrder.quantity,
            menuItemName
          );
        } else {
          customerOrder.orderStatus = "Pending";
          customerOrder.payment.paymentStatus = "Failed";
          customerOrder.payment.amountPaid = 0;
        }
      }
    });

    await order.save();

    // Redirect to frontend with actual status
    const redirectUrl = `http://localhost:5173/payment-success?orderId=${order._id}
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

//Get all order of the item
export const getAllOrderPerItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.user._id;

    const orders = await Order.find({ menuItemId: itemId });

    if (!orders) {
      return res.status(404).json({ message: "Order not found for this item" });
    }

    res.status(200).json({ message: "successfully fetch.", orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to fetch all order per item" });
  }
};

//Get my orders
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findOne({ _id: userId }).populate("myOrders");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const myOrders = [];
    for (let order of user.myOrders) {
      const orderId = order._id;
      // console.log(orderId);

      const orders = await Order.findOne(orderId)
        .populate({
          path: "menuItemId",
          select: "menuItemName category price ingredients.amountUsedPerItem",
          populate: [
            {
              path: "ingredients.ingredientId",
              model: "Inventory",
              select: "ingredientName unit",
            },
            {
              path: "restaurantId", // Populate restaurant details including currency
              model: "Restaurant",
              select: "currency",
            },
          ],
        })
        .populate({
          path: "restaurantId",
          select:
            "restaurantName restaurantAddress restaurantEmail restaurantPhone",
        })
        .select(
          "orderedBy.name orderedBy.tableNumber orderedBy.quantity orderedBy.totalPrice orderedBy.orderStatus"
        )
        .exec();

      if (!orders) {
        return res
          .status(404)
          .json({ message: "Order placed by thise user not found." });
      }

      myOrders.push(orders);
    }

    res.status(200).json({ message: "My orders:", orders: myOrders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to access my orders.", error });
  }
};

//Get All Order
export const getAllOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const userId = req.user._id;

    const user = await User.findOne(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const orders = await Order.find(orderId);

    if (!orders) {
      return res.status(404).json({ message: "There is no orders." });
    }

    res
      .status(200)
      .json({ message: "All order in this restaurant is:", orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to get all order." });
  }
};

//Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const orderId = req.params.id;

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        "orderedBy.orderStatus": "Confirmed",
      },
      {
        $set: {
          "orderedBy.$.orderStatus": orderStatus,
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ message: "Order not found or it is not confirmed." });
    }

    res
      .status(200)
      .json({ message: "Order status update successfully.", updatedOrder });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to udpate status of order.", error });
  }
};
