const nodemailer = require("nodemailer");

const createTransporter = () => {
  if (process.env.NODE_ENV === "production") {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }

  console.log("⚠️ No email credentials found, using console transport");
  return nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true,
  });
};

const safeFormatPrice = (v) => {
  if (v == null) return "0.00";
  const n = typeof v === "number" ? v : Number(v) || 0;
  return n.toFixed(2);
};

const sendMail = async (mailOptions) => {
  const transporter = createTransporter();
  return transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (email, firstName, verificationToken) => {
  const verificationUrl = `${
    process.env.FRONTEND_URL || "https://www.flauntbynishi.com"
  }/verify-email?token=${verificationToken}`;
  const mailOptions = {
    from: `"Flaunt by Nishi" <${
      process.env.EMAIL_FROM || "flauntbynishi@gmail.com"
    }>`,
    to: email,
    subject: "Verify Your Email Address - Flaunt by Nishi",
    html: `<!doctype html><html><body><h2>Hi ${
      firstName || ""
    }!</h2><p>Please verify your email: <a href="${verificationUrl}">Verify Email</a></p></body></html>`,
    text: `Hi ${firstName || ""},\n\nVerify your email: ${verificationUrl}`,
  };
  try {
    const info = await sendMail(mailOptions);
    if (process.env.NODE_ENV !== "production")
      console.log("DEV EMAIL - verification sent to", email);
    return { success: true, messageId: info && info.messageId };
  } catch (err) {
    console.error("sendVerificationEmail error", err);
    throw err;
  }
};

const sendWelcomeEmail = async (email, firstName) => {
  const mailOptions = {
    from: `"Flaunt By Nishi Team" <${
      process.env.EMAIL_FROM || "noreply@flauntbynishi.com"
    }>`,
    to: email,
    subject: "🎉 Welcome to Flaunt By Nishi",
    html: `<div><h2>Hi ${
      firstName || ""
    }!</h2><p>Welcome to Flaunt By Nishi.</p></div>`,
  };
  try {
    const info = await sendMail(mailOptions);
    return { success: true, messageId: info && info.messageId };
  } catch (err) {
    console.error("sendWelcomeEmail error", err);
    return { success: false, error: err && err.message };
  }
};

const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const resetUrl = `${
    process.env.FRONTEND_URL || "https://www.flauntbynishi.com"
  }/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: `"Flaunt By Nishi Team" <${
      process.env.EMAIL_FROM || "flauntbynishi@gmail.com"
    }>`,
    to: email,
    subject: "Reset your Flaunt By Nishi password",
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>Hi ${firstName || "there"},</p>
      <p>We received a request to reset your password for your Flaunt By Nishi account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #95522C; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      <p>This link will expire in 10 minutes for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br>Flaunt By Nishi Team</p>
    </div>`,
    text: `Hi ${firstName || "there"},\n\nWe received a request to reset your password.\n\nReset your password by clicking this link: ${resetUrl}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nFlaunt By Nishi Team`,
  };
  try {
    console.log(`📧 Sending password reset email to ${email}`);
    const info = await sendMail(mailOptions);
    console.log(`✅ Password reset email sent successfully to ${email}`);
    return { success: true, messageId: info && info.messageId };
  } catch (err) {
    console.error("❌ sendPasswordResetEmail error:", err);
    throw err;
  }
};

const sendOrderPickedEmail = async (email, firstName, order) => {
  const mailOptions = {
    from: `"Flaunt By Nishi Team" <${
      process.env.EMAIL_FROM || "noreply@flauntbynishi.com"
    }>`,
    to: email,
    subject: `Your order ${
      order && order.orderNumber ? order.orderNumber : ""
    } has been picked up`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
        <div style="background:linear-gradient(135deg,#C17237,#FFF2E1); color:#fff; padding:18px; border-radius:8px; text-align:center;">
          <h2 style="margin:0">Order Picked Up</h2>
        </div>
        <div style="background:#fff; padding:20px; border-radius:8px; margin-top:12px;">
          <p>Hi ${firstName || ""},</p>
          <p>Your order <strong>${
            order && order.orderNumber ? order.orderNumber : ""
          }</strong> has been picked up and is on its way.</p>
          <p>You can track your shipment using the AWB number available in your order details.</p>
          <p>Best regards,<br/>Flaunt By Nishi Team</p>
        </div>
      </div>
    `,
    text: `Hi ${firstName || ""},\n\nYour order ${
      order && order.orderNumber ? order.orderNumber : ""
    } has been picked up and is on its way.`,
  };
  try {
    const info = await sendMail(mailOptions);
    return { success: true, messageId: info && info.messageId };
  } catch (err) {
    console.error("sendOrderPickedEmail error", err);
    return { success: false, error: err && err.message };
  }
};

const sendOrderPlacedEmail = async (email, firstName, order) => {
  const orderUrl = `${
    process.env.FRONTEND_URL || "http://localhost:3500"
  }/orders/${order && (order._id || order.id) ? order._id || order.id : ""}`;
  const itemsHtml =
    order && order.items && order.items.length
      ? order.items
          .map(
            (i) =>
              `<li>${i.quantity} × ${
                (i.product && i.product.name) || i.name || "Item"
              } — ₹${safeFormatPrice(i.price)}</li>`
          )
          .join("")
      : "<li>No items</li>";
  const mailOptions = {
    from: `"Flaunt By Nishi Team" <${
      process.env.EMAIL_FROM || "noreply@flauntbynishi.com"
    }>`,
    to: email,
    subject: `Order Confirmation — ${
      order && order.orderNumber ? order.orderNumber : ""
    }`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:680px; margin:0 auto; padding:20px; background:#FFF8FA; color:#111827;">
        <div style="background:linear-gradient(135deg,#C17237,#FFF2E1); color:#fff; padding:18px; border-radius:8px; text-align:center;">
          <h2 style="margin:0">Order Confirmed</h2>
        </div>
        <div style="background:#fff; padding:20px; border-radius:8px; margin-top:12px;">
          <p>Hi ${firstName || ""},</p>
          <p>Thanks for your order! Order #: <strong>${
            order && order.orderNumber ? order.orderNumber : ""
          }</strong></p>
          <h4>Items</h4>
          <ul>${itemsHtml}</ul>
          <p><strong>Total:</strong> ₹${safeFormatPrice(
            order && order.total
          )}</p>
          <div style="text-align:center; margin:18px 0;"><a href="${orderUrl}" style="display:inline-block;padding:10px 16px;background:linear-gradient(90deg,#C17237,#FFF2E1);color:#fff;border-radius:8px;text-decoration:none">View Your Order</a></div>
        </div>
      </div>
    `,
    text: `Hi ${firstName || ""},\n\nThanks for your order ${
      order && order.orderNumber ? order.orderNumber : ""
    }. View: ${orderUrl}`,
  };
  try {
    const info = await sendMail(mailOptions);
    return { success: true, messageId: info && info.messageId };
  } catch (err) {
    console.error("sendOrderPlacedEmail error", err);
    return { success: false, error: err && err.message };
  }
};

const sendOrderStatusUpdateEmail = async (
  email,
  firstName,
  order,
  status,
  trackingInfo = null
) => {
  const trackingHtml =
    trackingInfo && (trackingInfo.awb || trackingInfo.trackingUrl)
      ? `<p><strong>AWB / Tracking:</strong> ${trackingInfo.awb || ""} ${
          trackingInfo.trackingUrl
            ? ` — <a href="${trackingInfo.trackingUrl}">Track shipment</a>`
            : ""
        }</p>`
      : "";
  const mailOptions = {
    from: `"Flaunt By Nishi Team" <${
      process.env.EMAIL_FROM || "noreply@flauntbynishi.com"
    }>`,
    to: email,
    subject: `Update on your order ${
      order && order.orderNumber ? order.orderNumber : ""
    }: ${status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:680px; margin:0 auto; padding:20px; background:#FFF8FA; color:#111827;">
        <div style="background:linear-gradient(135deg,#C17237,#FFF2E1); color:#fff; padding:18px; border-radius:8px; text-align:center;"><h2 style="margin:0">Order Update</h2></div>
        <div style="background:#fff; padding:20px; border-radius:8px; margin-top:12px;"><p>Hi ${
          firstName || ""
        },</p><p>Your order <strong>${
      order && order.orderNumber ? order.orderNumber : ""
    }</strong> status is now <strong>${status}</strong>.</p>${trackingHtml}</div>
      </div>
    `,
    text: `Hi ${firstName || ""},\n\nYour order ${
      order && order.orderNumber ? order.orderNumber : ""
    } status is now: ${status}${
      trackingInfo && trackingInfo.trackingUrl
        ? "\nTrack: " + trackingInfo.trackingUrl
        : ""
    }`,
  };
  try {
    const info = await sendMail(mailOptions);
    return { success: true, messageId: info && info.messageId };
  } catch (err) {
    console.error("sendOrderStatusUpdateEmail error", err);
    return { success: false, error: err && err.message };
  }
};

const sendOrderCancellationEmail = async (email, firstName, order) => {
  const isPrepaid =
    order &&
    order.payment &&
    (String(order.payment.status || "").toLowerCase() === "paid" ||
      (order.payment.method &&
        String(order.payment.method).toLowerCase() !== "cod"));
  const itemsHtml =
    order && order.items && order.items.length
      ? order.items
          .map(
            (i) =>
              `<li>${i.quantity} × ${
                (i.product && i.product.name) || i.name || "Item"
              } — ₹${safeFormatPrice(i.price)}</li>`
          )
          .join("")
      : "<li>No items</li>";
  const mailOptions = {
    from: `"Flaunt By Nishi Team" <${
      process.env.EMAIL_FROM || "noreply@flauntbynishi.com"
    }>`,
    to: email,
    subject: `Your Order Has Been Cancelled`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; background:#FFF8FA; color:#111827;">
        <div style="background:linear-gradient(135deg,#C17237,#FFF2E1); color:#fff; padding:18px; border-radius:8px; text-align:center;"><h2 style="margin:0">Aapka order cancel kar diya gaya hai</h2></div>
        <div style="background:#fff; padding:20px; border-radius:8px; margin-top:12px;"><p>Hi ${
          firstName || ""
        },</p><p>Your order <strong>${
      order && order.orderNumber ? order.orderNumber : ""
    }</strong> has been cancelled.</p>${
      order && order.cancellationReason
        ? `<p><strong>Reason:</strong> ${order.cancellationReason}</p>`
        : ""
    }${
      isPrepaid
        ? `<p>Aapko refund 5-7 working days ke andar mil jayega.</p>`
        : ""
    }<h4>Order Summary</h4><ul>${itemsHtml}</ul>${
      isPrepaid
        ? `<p><strong>Total refunded (if applicable):</strong> ₹${safeFormatPrice(
            order && order.total
          )}</p>`
        : ""
    }<p>If you have any questions, reply to this email or contact our support.</p></div>
      </div>
    `,
    text: `Aapka order cancel kar diya gaya hai.${
      isPrepaid ? " Refund will be processed in 5-7 working days." : ""
    }\n\nOrder: ${order && order.orderNumber ? order.orderNumber : ""}`,
  };
  try {
    const info = await sendMail(mailOptions);
    return { success: true, messageId: info && info.messageId };
  } catch (err) {
    console.error("sendOrderCancellationEmail error", err);
    return { success: false, error: err && err.message };
  }
};

const sendOTPEmail = async (email, otp, firstName = "") => {
  const mailOptions = {
    from: `"Flaunt by Nishi" <${
      process.env.EMAIL_FROM || "noreply@flauntbynishi.com"
    }>`,
    to: email,
    subject: "Your Verification Code - Flaunt by Nishi",
    html: `<!doctype html><html><body><h2>${
      firstName ? `Hi ${firstName}!` : "Hi!"
    }</h2><p>Your verification code is <strong>${otp}</strong></p><p>This code will expire in 5 minutes.</p></body></html>`,
    text: `Your verification code is: ${otp}`,
  };
  try {
    const info = await sendMail(mailOptions);
    if (process.env.NODE_ENV !== "production") console.log("DEV OTP:", otp);
    return { success: true, messageId: info && info.messageId };
  } catch (err) {
    console.error("sendOTPEmail error", err);
    throw err;
  }
};

/**
 * Send refund notification email
 * @param {String} email - Customer email
 * @param {String} firstName - Customer first name
 * @param {Object} order - Order document
 * @param {Object} refundResult - Refund processing result
 */
const sendRefundNotificationEmail = async (email, firstName, order, refundResult) => {
  const refundAmount = refundResult.amount || order.total || 0;
  const refundId = refundResult.refundId || 'N/A';
  const refundStatus = refundResult.status || 'initiated';
  
  const itemsHtml =
    order && order.items && order.items.length
      ? order.items
          .map(
            (i) =>
              `<li>${i.quantity} × ${
                (i.product && i.product.name) || i.name || "Item"
              } — ₹${safeFormatPrice(i.price)}</li>`
          )
          .join("")
      : "<li>No items</li>";

  const mailOptions = {
    from: `"Flaunt By Nishi Team" <${
      process.env.EMAIL_FROM || "noreply@flauntbynishi.com"
    }>`,
    to: email,
    subject: `Refund ${refundStatus === 'processed' || refundStatus === 'completed' ? 'Processed' : 'Initiated'} for Order ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; background:#FFF8FA; color:#111827;">
        <div style="background:linear-gradient(135deg,#4CAF50,#81C784); color:#fff; padding:18px; border-radius:8px; text-align:center;">
          <h2 style="margin:0">💰 Refund ${refundStatus === 'processed' || refundStatus === 'completed' ? 'Processed' : 'Initiated'}</h2>
        </div>
        
        <div style="background:#fff; padding:20px; border-radius:8px; margin-top:12px;">
          <p>Hi ${firstName || "there"},</p>
          
          <p>Your refund for order <strong>${order.orderNumber}</strong> has been ${refundStatus === 'processed' || refundStatus === 'completed' ? 'processed successfully' : 'initiated'}.</p>
          
          <div style="background:#F3F4F6; padding:15px; border-radius:8px; margin:20px 0;">
            <h3 style="margin:0 0 10px 0; color:#1F2937;">Refund Details</h3>
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;"><strong>Refund Amount:</strong></td>
                <td style="padding:8px 0; text-align:right;">₹${safeFormatPrice(refundAmount)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;"><strong>Refund ID:</strong></td>
                <td style="padding:8px 0; text-align:right;">${refundId}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;"><strong>Status:</strong></td>
                <td style="padding:8px 0; text-align:right;">
                  <span style="background:#4CAF50; color:white; padding:4px 12px; border-radius:4px; font-size:12px;">${refundStatus.toUpperCase()}</span>
                </td>
              </tr>
            </table>
          </div>

          ${refundStatus === 'processed' || refundStatus === 'completed' ? `
            <p style="background:#E8F5E9; padding:12px; border-left:4px solid #4CAF50; margin:15px 0;">
              ✅ Your refund has been processed and should reflect in your account within <strong>5-7 business days</strong>, depending on your bank.
            </p>
          ` : `
            <p style="background:#FFF3CD; padding:12px; border-left:4px solid #FFC107; margin:15px 0;">
              ⏳ Your refund is being processed and will be credited to your original payment method within <strong>5-7 business days</strong>.
            </p>
          `}

          <h4 style="margin-top:25px;">Order Summary</h4>
          <ul style="padding-left:20px;">${itemsHtml}</ul>
          
          <p style="margin-top:25px; font-size:14px; color:#6B7280;">
            If you have any questions about your refund, please don't hesitate to contact our support team.
          </p>
        </div>

        <div style="text-align:center; margin-top:20px; padding:15px; font-size:12px; color:#9CA3AF;">
          <p>Thank you for shopping with Flaunt By Nishi!</p>
          <p>© ${new Date().getFullYear()} Flaunt By Nishi. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Hi ${firstName || "there"},\n\nYour refund for order ${order.orderNumber} has been ${refundStatus === 'processed' || refundStatus === 'completed' ? 'processed successfully' : 'initiated'}.\n\nRefund Amount: ₹${safeFormatPrice(refundAmount)}\nRefund ID: ${refundId}\nStatus: ${refundStatus.toUpperCase()}\n\n${refundStatus === 'processed' || refundStatus === 'completed' ? 'Your refund should reflect in your account within 5-7 business days.' : 'Your refund will be credited to your original payment method within 5-7 business days.'}\n\nThank you for shopping with Flaunt By Nishi!`,
  };

  try {
    const info = await sendMail(mailOptions);
    console.log(`Refund notification email sent to ${email}`);
    return { success: true, messageId: info && info.messageId };
  } catch (err) {
    console.error("sendRefundNotificationEmail error", err);
    return { success: false, error: err && err.message };
  }
};

module.exports = {
  createTransporter,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderPickedEmail,
  sendOrderPlacedEmail,
  sendOrderStatusUpdateEmail,
  sendOrderCancellationEmail,
  sendRefundNotificationEmail,
  sendOTPEmail,
};
