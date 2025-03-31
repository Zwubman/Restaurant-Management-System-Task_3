import cron from "node-cron";
import Order from "../Models/orderModel.js";


//Cancel the order when the payment is not payed and order status is confirmed with in 90 minute
cron.schedule("0 * * * *", async () => {
  console.log("Running cron job to cancel unpaid orders...");

  try {
    const currentTime = new Date();

    // Find orders that are "Pending" and have payment status not "Paid"
    const orders = await Order.find({
      "orderedBy.orderStatus": "Pending",
      "orderedBy.payment.paymentStatus": { $ne: "Paid" },
    });

    // Loop through each order
    for (let order of orders) {
      const orderTime = order.orderedBy[0].orderDateTime;

      // Calculate the timeDifferenceference between current time and the order's time
      const timeDifference = currentTime - new Date(orderTime);  
      const minutes = Math.floor(timeDifference / (1000 * 60));  

      console.log(`Order placed at: ${orderTime}`);
      console.log(`Time time differenceference: ${minutes} minute(s)`);

      // If the order was placed more than or equal to 1 minute ago, cancel the order
      if (minutes >= 90) {
        await Order.updateMany(
          { _id: order._id },  
          {
            $set: {
              "orderedBy.$[].orderStatus": "Canceled",
              "orderedBy.$[].payment.paymentStatus": "Canceled",
            },
          }
        );

        console.log(`Order with ID ${order._id} has been canceled.`);
      }
    }

  } catch (error) {
    console.error("Error canceling unpaid orders:", error);
  }
});
