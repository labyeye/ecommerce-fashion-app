const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === "production") {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      console.log("⚠️ No email credentials found, using console transport");
      return nodemailer.createTransport({
        streamTransport: true,
        newline: "unix",
        buffer: true,
      });
    }
  }
};
const sendVerificationEmail = async (email, firstName, verificationToken) => {
  try {
    const transporter = createTransporter();

    const verificationUrl = `${
      process.env.FRONTEND_URL || "https://flauntbynishi.com"
    }/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"Flaunt by Nishi" <${
        process.env.EMAIL_FROM || "noreply@flauntbynishi.com"
      }>`,
      to: email,
      subject: "Verify Your Email Address - Flaunt by Nishi",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: 'Inter', 'Arial', sans-serif;
              background: #FFF8FA;
              color: #111827;
              max-width: 600px;
              margin: 0 auto;
              padding: 0;
            }
            .header {
              background: linear-gradient(135deg, #914D26, #FFF2E1);
              color: #fff;
              text-align: center;
              padding: 32px 24px 24px 24px;
              border-radius: 18px 18px 0 0;
            }
            .logo {
              width: 60px;
              height: 60px;
              margin-bottom: 12px;
              border-radius: 50%;
              background: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.07);
            }
            .content {
              background: #fff;
              padding: 32px 24px;
              border-radius: 0 0 18px 18px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            }
            .button {
              display: inline-block;
              background: linear-gradient(90deg, #914D26, #FFF2E1);
              color: #fff;
              padding: 12px 28px;
              text-decoration: none;
              border-radius: 24px;
              font-weight: 700;
              font-size: 15px;
              margin: 20px 0;
              box-shadow: 0 4px 14px rgba(219,39,119,0.12);
              letter-spacing: 0.3px;
            }
            .footer {
              text-align: center;
              margin-top: 28px;
              padding-top: 16px;
              border-top: 1px solid #f1e6ea;
              color: #9CA3AF;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <img src="https://flauntbynishi.com/logo.png" alt="Flaunt by Nishi" style="width:44px;height:44px;object-fit:contain;" />
            </div>
            <h1 style="font-size:2rem; font-weight:700; margin-bottom:8px;">Welcome to Flaunt by Nishi</h1>
            <p style="font-size:1rem; font-weight:400;">Thanks for joining our style community</p>
          </div>
          <div class="content">
            <h2 style="font-size:1.25rem; font-weight:600; color:#111827;">Hi ${firstName}!</h2>
            <p style="margin:16px 0 8px 0;">We're excited to welcome you to Flaunt by Nishi — where style meets confidence.</p>
            <p style="margin-bottom:16px;">To activate your account and unlock member benefits, please verify your email by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p style="margin:24px 0 8px 0; color:#9CA3AF;">This verification link will expire in 24 hours for security reasons.</p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #914D26;">${verificationUrl}</p>
            <p>If you didn't create an account with Flaunt by Nishi, you can safely ignore this email.</p>
            <p style="margin-top:24px;">Best regards,<br>The Flaunt by Nishi Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Flaunt by Nishi. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${firstName}!
        
        Welcome to Flaunt by Nishi! We're excited to have you as part of our style-forward family.
        
        To complete your registration, please verify your email address by visiting this link:
        ${verificationUrl}
        
        This verification link will expire in 24 hours for security reasons.
        
        If you didn't create an account with Flaunt by Nishi, you can safely ignore this email.
        
        Best regards,
        The Flaunt by Nishi Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Verification email sent:", info.messageId);

    // For development, log the email content
    if (process.env.NODE_ENV !== "production") {
      console.log("=== DEVELOPMENT EMAIL LOG ===");
      console.log("To:", email);
      console.log("Subject:", mailOptions.subject);
      console.log("Verification URL:", verificationUrl);
      console.log("Email content logged instead of sent");
      console.log("=== END EMAIL LOG ===");
    }

    return {
      success: true,
      messageId: info.messageId || "dev-message-id",
      previewUrl: null,
    };
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send verification email");
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Flaunt By Nishi Team" <${
        process.env.EMAIL_FROM || "noreply@flauntbynishi.com"
      }>`,
      to: email,
      subject: "🎉 Welcome to Flaunt By Nishi - Your Journey Begins Now!",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Flaunt By Nishi</title>
          <style>
            body { font-family: Arial, sans-serif; line-height:1.6; color:#111827; max-width:600px; margin:0 auto; padding:20px; background:#FFF8FA }
            .header { background: linear-gradient(135deg,#DB2777,#F973A0); color:#fff; text-align:center; padding:28px; border-radius:10px 10px 0 0 }
            .content { background:#fff; padding:24px; border-radius:0 0 10px 10px }
            .button { display:inline-block; background:linear-gradient(90deg,#DB2777,#F973A0); color:#fff; padding:12px 26px; text-decoration:none; border-radius:22px; font-weight:700 }
            .feature { background:#fff; padding:16px; margin:12px 0; border-radius:8px; border-left:4px solid #FCA5D1 }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Welcome to Flaunt By Nishi!</h1>
            <p>Your email has been verified successfully</p>
          </div>
          
          <div class="content">
            <h2>Hi ${firstName}!</h2>
            
            <p>Congratulations! Your email has been verified and your Flaunt By Nishi account is now active.</p>
            
            <div class="feature">
              <h3>✨ New Arrivals & Editor Picks</h3>
              <p>Discover curated pieces and seasonal favorites handpicked for you.</p>
            </div>

            <div class="feature">
              <h3>⚡ Evolv Points Rewards</h3>
              <p>Earn points with every purchase and redeem them for exclusive discounts.</p>
            </div>

            <div class="feature">
              <h3>🔁 Easy Returns & Exchanges</h3>
              <p>Hassle-free returns within 15 days — because we want you to love every order.</p>
            </div>

            <div style="text-align: center;">
              <a href="${
                process.env.FRONTEND_URL || "https://flauntbynishi.com"
              }" class="button">Start Shopping</a>
            </div>

            <p>Explore the latest collections and enjoy member benefits on your first order.</p>
            
            <p>Best regards,<br>The Flaunt By Nishi Team</p>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Welcome email sending error:", error);
    // Don't throw error for welcome email as it's not critical
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  try {
    const transporter = createTransporter();

    const resetUrl = `${
      process.env.FRONTEND_URL || "https://flauntbynishi.com"
    }/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Flaunt By Nishi Team" <${
        process.env.EMAIL_FROM || "noreply@flauntbynishi.com"
      }>`,
      to: email,
      subject: "Reset your Flaunt By Nishi password",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; background:#FFF8FA; color:#111827 }
            .button { display:inline-block; padding:12px 20px; background:linear-gradient(90deg,#DB2777,#F973A0); color:#fff; border-radius:8px; text-decoration:none }
          </style>
        </head>
        <body>
          <h2>Hi ${firstName || ""},</h2>
          <p>We received a request to reset your password. Click the button below to set a new password. This link will expire in 10 minutes.</p>
          <p style="text-align:center;"><a href="${resetUrl}" class="button">Reset your password</a></p>
          <p>If the button doesn't work, copy and paste the link below into your browser:</p>
          <p style="word-break:break-all;">${resetUrl}</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>— The Flaunt By Nishi Team</p>
        </body>
        </html>
      `,
      text: `Hi ${
        firstName || ""
      },\n\nUse the following link to reset your password (expires in 10 minutes):\n\n${resetUrl}\n\nIf you didn't request this, ignore this message.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      "Password reset email sent:",
      info.messageId || "dev-message-id"
    );

    if (process.env.NODE_ENV !== "production") {
      console.log("=== PASSWORD RESET EMAIL LOG ===");
      console.log("To:", email);
      console.log("Reset URL:", resetUrl);
      console.log("=== END EMAIL LOG ===");
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Password reset email error:", error);
    throw new Error("Failed to send password reset email");
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};

// Send order cancellation email
const sendOrderCancellationEmail = async (email, firstName, order) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Flaunt By Nishi Team" <${
        process.env.EMAIL_FROM || "noreply@flauntbynishi.com"
      }>`,
      to: email,
      subject: `Your order ${order.orderNumber || ""} has been cancelled`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
          <div style="background:linear-gradient(135deg,#DB2777,#F973A0); color:#fff; padding:18px; border-radius:8px; text-align:center;">
            <h2 style="margin:0">Order Cancelled</h2>
          </div>
          <div style="background:#fff; padding:20px; border-radius:8px; margin-top:12px;">
            <p>Hi ${firstName || ""},</p>
            <p>We're writing to confirm that your order <strong>${
              order.orderNumber || ""
            }</strong> has been cancelled.</p>
            ${
              order.cancellationReason
                ? `<p><strong>Reason:</strong> ${order.cancellationReason}</p>`
                : ""
            }
            <h4>Order Summary</h4>
            <ul>
              ${
                order.items && order.items.length > 0
                  ? order.items
                      .map(
                        (item) =>
                          `<li>${item.quantity} × ${
                            item.product?.name || item.name || "Item"
                          } — ₹${
                            (item.price || 0).toFixed
                              ? item.price.toFixed(2)
                              : item.price
                          }</li>`
                      )
                      .join("")
                  : "<li>No items</li>"
              }
            </ul>
            <p><strong>Total refunded (if applicable):</strong> ₹${
              (order.total || 0).toFixed ? order.total.toFixed(2) : order.total
            }</p>
            <p>If you have any questions, reply to this email or contact our support.</p>
            <p>Best regards,<br/>Flaunt By Nishi Team</p>
          </div>
        </div>
      `,
      text: `Hi ${firstName || ""},\n\nYour order ${
        order.orderNumber || ""
      } has been cancelled.\n\nIf you have questions, contact support.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      "Order cancellation email sent:",
      info.messageId || "dev-message-id"
    );
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending order cancellation email:", error);
    return { success: false, error: error.message };
  }
};

// Send OTP Email
const sendOTPEmail = async (email, otp, firstName = "") => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Flaunt by Nishi" <${
        process.env.EMAIL_FROM || "noreply@flauntbynishi.com"
      }>`,
      to: email,
      subject: "Your Verification Code - Flaunt by Nishi",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Verification</title>
          <style>
            body { font-family: 'Inter', 'Arial', sans-serif; background:#FFF8FA; color:#111827; max-width:600px; margin:0 auto; padding:0 }
            .header { background: linear-gradient(135deg,#DB2777,#F973A0); color:#fff; text-align:center; padding:32px 24px; border-radius:18px 18px 0 0 }
            .content { background:#fff; padding:28px 24px; border-radius:0 0 18px 18px; box-shadow:0 2px 8px rgba(0,0,0,0.04) }
            .otp-code { display:inline-block; background:linear-gradient(90deg,#DB2777,#F973A0); color:#fff; padding:18px 36px; font-size:28px; font-weight:700; letter-spacing:6px; border-radius:10px; margin:18px 0; box-shadow:0 6px 18px rgba(219,39,119,0.12) }
            .footer { text-align:center; margin-top:28px; padding-top:16px; border-top:1px solid #f1e6ea; color:#9CA3AF; font-size:13px }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="font-size:1.8rem; font-weight:700; margin-bottom:8px;">Verification Code</h1>
            <p style="font-size:1rem; font-weight:400;">Your One-Time Password</p>
          </div>
          <div class="content">
            ${
              firstName
                ? `<h2 style="font-size:1.25rem; font-weight:600; color:#111827;">Hi ${firstName}!</h2>`
                : ""
            }
            <p style="margin:16px 0 8px 0;">Please use the following verification code to complete your action:</p>
            <div style="text-align: center;">
              <div class="otp-code">${otp}</div>
            </div>
            <p style="margin:24px 0 8px 0; color:#9CA3AF; font-weight:600;">This code will expire in 5 minutes.</p>
            <p style="margin-top:16px;">For your security, do not share this code with anyone.</p>
            <p style="margin-top:24px;">If you didn't request this code, please ignore this email or contact our support team.</p>
            <p style="margin-top:24px;">Best regards,<br>The Flaunt by Nishi Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Flaunt by Nishi. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        ${
          firstName ? `Hi ${firstName}!\n\n` : ""
        }Your verification code is: ${otp}
        
        This code will expire in 5 minutes.
        
        For your security, do not share this code with anyone.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        The Flaunt by Nishi Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent:", info.messageId || "dev-message-id");

    // For development, log the OTP
    if (process.env.NODE_ENV !== "production") {
      console.log("=== DEVELOPMENT OTP LOG ===");
      console.log("To:", email);
      console.log("OTP:", otp);
      console.log("=== END OTP LOG ===");
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

// Export the new function
module.exports.sendOrderCancellationEmail = sendOrderCancellationEmail;
module.exports.sendOTPEmail = sendOTPEmail;

// Export transporter creator for other modules that may want to send custom emails
module.exports.createTransporter = createTransporter;
