import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendReservationEmail = async (
  userEmail,
  tableNumber,
  restaurantName,
  customerName,
  startDate,
  startTime,
  endDate,
  endTime,
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
      <p><strong>Reservation Start Time:</strong> ${startTime} on ${startDate}</p>
      <p><strong>Reservation End Time:</strong> ${endTime} on ${endDate}</p>
      <p><strong>Reservation Amount:</strong> ${reservationAmount}</p>
      <p>To confirm your reservation, <strong style="color: blue;">please back and pay for the reservation amount of</strong> 
      <strong>${reservationAmount}</strong> at the restaurant before your reservation time.</p>
      <p>We look forward to serving you at ${restaurantName}!</p>
      <p>Best regards,</p>
      <p>Team ${restaurantName}!</p>
      <p>Manager: Wubamlak Girum</p>
    `,
    };

    //send email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to: ", userEmail);
  } catch (error) {
    console.log("Error sending email: ", error);
  }
};

export const sendMailcancelReservation = async (
  userEmail,
  restaurantName,
  tableNumber,
  customerName,
  startDate,
  startTime,
  endDate,
  endTime
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.cm",
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
      subject: "Reservation Canceled Successfully.",
      html: `
      <h2>Reservation Cancellation Confirmation</h2>
      <p>Hello <strong>${customerName}</strong>,</p>
      <p>You have successfully canceled your reservation at <strong>${restaurantName}</strong>.</p>
      <p>Your reservation was originally scheduled for:</p>
      <ul>
        <li><strong>Table Number:</strong> ${tableNumber}</li>
        <li><strong>Reservation Start Time:</strong> ${startTime} on ${startDate}</li>
        <li><strong>Reservation End Time:</strong> ${endTime} on ${endDate}</li>
        <li><strong>Reservation Amount:</strong> ${reservationAmount}</li>
      </ul>
      <p>If this cancellation was made by mistake, you may need to rebook a new reservation at <strong>${restaurantName}</strong>.</p>
      <p>For any assistance, feel free to contact us.</p>
      <p>We hope to serve you in the future!</p>
      <p>Best regards,</p>
      <p>Team ${restaurantName}!</p>
      <p>Manager: Wubamlak Girum</p>
    `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to: ", userEmail);
  } catch (error) {
    console.log("Error sending email:", error);
  }
};
