import nodemailer from "nodemailer";

export const sendReservationEmail = async (
  userEmail,
  tableNumber,
  restaurantName,
  customerName,
  reservationStartDateTime,
  reservationEndDateTime,
  reservationAmount
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Reservation Is Successfully Booked!",
      html: `
      <h2>Reservation Confirmation</h2>
      <p>Congratulations <strong>${customerName}</strong>,</p>
      <p>You have successfully booked a reservation at <strong>${restaurantName}</strong>.</p>
      <p>Your table number is <strong>${tableNumber}</strong>.</p>
      <p><strong>Reservation Start Time:</strong> ${reservationStartDateTime}</p>
      <p><strong>Reservation End Time:</strong> ${reservationEndDateTime}</p>
      <p><strong>Reservation Amount:</strong> $${reservationAmount}</p>
      <p>To confirm your reservation, please back and pay for the reservation amount of 
      <strong>$${reservationAmount}</strong> at the restaurant before your reservation time.</p>
      <p>We look forward to serving you at ${restaurantName}!</p>
      <p>Best regards,</p>
      <p>The ${restaurantName} Team</p>
    `,
    };

    //send email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to: ", email)
  } catch (error) {
    console.log(error);
  }
};
