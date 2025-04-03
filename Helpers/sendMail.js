import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmailNotification = async (
  userEmail,
  restaurantName,
  tableNumber,
  customerName,
  startDate,
  startTime,
  endDate,
  endTime,
  type,
  reservationAmount = null // Optional for cancellation
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

    let subject = "";
    let emailBody = "";

    if (type === "booking") {
      subject = "Reservation Is Successfully Booked!";
      emailBody = `
        <h2>Reservation Confirmation</h2>
        <p>Congratulations <strong>${customerName}</strong>,</p>
        <p>You have successfully booked a reservation at <strong>${restaurantName}</strong>.</p>
        <p>Your table number is <strong>${tableNumber}</strong>.</p>
        <p><strong>Reservation Start Time:</strong> ${startTime} on ${startDate}</p>
        <p><strong>Reservation End Time:</strong> ${endTime} on ${endDate}</p>
        <p><strong>Reservation Amount:</strong> ${reservationAmount}</p>
        <p>To confirm your reservation, <strong style="color: blue;">please go back and pay</strong> 
        <strong>${reservationAmount}</strong> at the restaurant before your reservation time.</p>
        <p>We look forward to serving you at ${restaurantName}!</p>
      `;
    } else if (type === "cancellation") {
      subject = "Reservation Canceled Successfully.";
      emailBody = `
        <h2>Reservation Cancellation Confirmation</h2>
        <p>Hello <strong>${customerName}</strong>,</p>
        <p>You have successfully canceled your reservation at <strong>${restaurantName}</strong>.</p>
        <p>Your reservation was originally scheduled for:</p>
        <ul>
          <li><strong>Table Number:</strong> ${tableNumber}</li>
          <li><strong>Reservation Start Time:</strong> ${startTime} on ${startDate}</li>
          <li><strong>Reservation End Time:</strong> ${endTime} on ${endDate}</li>
        </ul>
        <p>If this cancellation was made by mistake, you may need to rebook a new reservation at <strong>${restaurantName}</strong>.</p>
        <p>For any assistance, feel free to contact us.</p>
        <p>We hope to serve you in the future!</p>
      `;
    } else {
      throw new Error("Invalid email type. Use 'booking' or 'cancellation'.");
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject,
      html: `
        ${emailBody}
        <p>Best regards,</p>
        <p>Team ${restaurantName}!</p>
        <p>Manager: Wubamlak Girum</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to: ${userEmail}`);
  } catch (error) {
    console.log("Error sending email:", error);
  }
};

//To send notification when place order and cancel order
export const sendOrderEmailNotification = async (
  restaurantName,
  tableNumber,
  name,
  phone,
  menuItemName,
  quantity,
  type,
  totalPrice = null,
  
) => {
  try{
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    let subject = "";
    let emailBody = "";

    if(type === "Placement"){
      subject = "Order Placed Successfully – Payment Pending!";
      emailBody = `
            <h2>Order Placed Successfully!</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>You have successfully placed an order at <strong>${restaurantName}</strong>.</p>
            <p>Your order details are as follows:</p>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Phone:</strong> ${phone}</li>
                <li><strong>Item:</strong> ${menuItemName}</li>
                <li><strong>Quantity:</strong> ${quantity}</li>
                <li><strong>Position:</strong> Table Number ${tableNumber}</li>
                <li><strong>Total Price:</strong> ${totalPrice}</li>
            </ul>
            <p><strong>Please proceed with the payment of <span style="color: red;">${totalPrice}</span> to confirm your order.</strong></p>
            <p>Thank you for ordering at <strong>${restaurantName}</strong>!</p>`;

    }else if(type === "Cancellation"){
      subject = "Order Placed Successfully!";
      emailBody = `
            <h2>Order Cancellation Confirmation</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>You have successfully canceled your order at <strong>${restaurantName}</strong>.</p>
            <p>Your canceled order details are as follows:</p>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Phone:</strong> ${phone}</li>
                <li><strong>Item:</strong> ${menuItemName}</li>
                <li><strong>Quantity:</strong> ${quantity}</li>
                <li><strong>Position:</strong> Table Number ${tableNumber}</li>
            </ul>
            <p>If this cancellation was made by mistake, you may place a new order at <strong>${restaurantName}</strong>.</p>
            <p>For any assistance, feel free to contact us.</p>
            <p>We look forward to serving you in the future!</p>`;
    }else{
      throw new Error("Invalid email type. Use 'Order Placement' or 'Order Cancellation'.")
    }


    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject,
      html: `
        ${emailBody}
        <p>Best regards,</p>
        <p>Team ${restaurantName}!</p>
        <p>Manager: Wubamlak Girum</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to: ${userEmail}`);
  }catch(error){
    console.log("Error sending email: ", error);
  }
};

export const sendPaymentMailNotification = async (
  userEmail,
  customerName,
  restaurantName,
  tableNumber,
  amountPaid,
  paymentStatus,
  type,
  quantity = null,
  menuItemName = null
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

    let subject = "";
    let emailBody = "";

    if (type === "reservation") {
      subject = "Reservation Payment Confirmation!";
      emailBody = `
      <h2>Reservation Payment Confirmation</h2>
      <p>Dear <strong>${customerName}</strong>,</p>
      <p>We are pleased to inform you that your payment of <strong>${amountPaid}</strong> 
      for table number <strong>${tableNumber}</strong> at <strong>${restaurantName}</strong> 
      has been <strong>${paymentStatus}</strong>.</p>
      <p>Your reservation is now confirmed, and we look forward to serving you at <strong>${restaurantName}</strong>.</p>
      <p>If you have any questions or need further assistance, please feel free to contact us.</p>`;
    } else if (type === "order") {
      subject = "Order Payment Confirmation!";
      emailBody = `
      <h2>Order Payment Confirmation</h2>
      <p>Dear <strong>${customerName}</strong>,</p>
      <p>We are pleased to inform you that you have successfully <strong>${paymentStatus}</strong> 
      your payment of <strong>${amountPaid}</strong> for <strong>${quantity}</strong> order(s) of <strong>${menuItemName}</strong> at <strong>${restaurantName}</strong>.</p>
      <p>Your order has been placed on <strong>table number ${tableNumber}</strong>, and our team is preparing it for you.</p>
      <p>We appreciate your business and look forward to serving you!</p>
      <p>If you have any questions or need further assistance, please feel free to contact us.</p>`;
    } else {
      if (type !== "reservation" && type !== "order") {
        throw new Error("Invalid email type. Use 'reservation' or 'order'.");
      }
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject,
      html: `
        ${emailBody}
        <p>Best regards,</p>
        <p>Team ${restaurantName}!</p>
        <p>Manager: Wubamlak Girum</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to: ${userEmail}`);
  } catch (error) {
    console.log("Error sending email:", error);
  }
};
