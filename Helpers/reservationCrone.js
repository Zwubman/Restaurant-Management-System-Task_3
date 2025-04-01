import cron from "node-cron";
import Reserve from "../Models/reserveModel.js";

cron.schedule("0 0 * * ", async () => {
  try {

    const curretnTime = new Date();

    const reservations = await Reserve.find(
        {
            reservationStatus: "Pending",
            "payment.paymentStatus" :{ $ne: "Paid" }
        }
    );

    if(!reservations){
        return res.status(404).json({message: "Reservation with updaid and pending status is not found."})
    }
    const reservationTime = reservations.orderedBy.reservationStartDateTime;

    const timeDifference = reservationTime - curretnTime;

    for(let reservation of reservations){

    }
  } catch (error) {
    console.log(
      "Error canceling reservation when not paid for reservation bfore 24 hours from reservation start time."
    );
  }
});
