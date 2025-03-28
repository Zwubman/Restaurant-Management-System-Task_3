const enforceReservationStatusTransitions = function (next) {
    if (this.isNew) {
      this.reservationStatus = "Available"; 
    } else {
      // Define valid status transitions
      const validTransitions = {
        Available: ["Pending"], // Customer books => Pending
        Pending: ["Confirmed", "Canceled"], // Manager confirms/cancels
        Confirmed: ["Completed"], // After usage
        Canceled: [], // No further transitions
        Completed: [], // No further transitions
      };
  
      const previousStatus = this.get("reservationStatus"); // Previous status
      const newStatus = this.reservationStatus; // Attempted new status
  
      if (
        previousStatus &&
        validTransitions[previousStatus] &&
        !validTransitions[previousStatus].includes(newStatus)
      ) {
        return next(
          new Error(
            `Invalid reservation status change from '${previousStatus}' to '${newStatus}'.`
          )
        );
      }
    }
    next();
  };
  
  export default enforceReservationStatusTransitions;
  