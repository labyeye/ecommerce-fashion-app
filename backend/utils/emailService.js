const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For development, you can use Gmail or any SMTP service
  // For production, use services like SendGrid, AWS SES, etc.
  
  if (process.env.NODE_ENV === 'production') {
    // Production email service configuration
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development - use Gmail for testing
    // Make sure to set EMAIL_USER and EMAIL_PASS in .env file
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      // Fallback to console transport if no email credentials
      console.log('⚠️ No email credentials found, using console transport');
      return nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }
  }
};

// Send email verification
const sendVerificationEmail = async (email, firstName, verificationToken) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'https://flauntbynishi.com'}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: `"Flaunt by Nishi" <${process.env.EMAIL_FROM || 'noreply@flauntbynishi.com'}>`,
      to: email,
      subject: 'Verify Your Email Address - Flaunt by Nishi',
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
              background: #FFF2E1;
              color: #2B463C;
              max-width: 600px;
              margin: 0 auto;
              padding: 0;
            }
            .header {
              background: linear-gradient(135deg, #B5A084, #688F4E);
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
              background: linear-gradient(90deg, #B5A084, #688F4E);
              color: #fff;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 25px;
              font-weight: 600;
              font-size: 16px;
              margin: 24px 0;
              box-shadow: 0 2px 8px rgba(0,0,0,0.07);
              letter-spacing: 0.5px;
            }
            .footer {
              text-align: center;
              margin-top: 32px;
              padding-top: 18px;
              border-top: 1px solid #eee;
              color: #B5A084;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <img src="https://flauntbynishi.com/logo.png" alt="Flaunt by Nishi" style="width:44px;height:44px;object-fit:contain;" />
            </div>
            <h1 style="font-size:2rem; font-weight:700; margin-bottom:8px;">Welcome to Flaunt by Nishi!</h1>
            <p style="font-size:1rem; font-weight:400;">Thanks for joining our fashion community</p>
          </div>
          <div class="content">
            <h2 style="font-size:1.25rem; font-weight:600; color:#688F4E;">Hi ${firstName}!</h2>
            <p style="margin:16px 0 8px 0;">We're excited to have you as part of our style-forward family.</p>
            <p style="margin-bottom:16px;">To complete your registration and start your journey with us, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p style="margin:24px 0 8px 0; color:#B5A084;">This verification link will expire in 24 hours for security reasons.</p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #688F4E;">${verificationUrl}</p>
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
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Verification email sent:', info.messageId);
    
    // For development, log the email content
    if (process.env.NODE_ENV !== 'production') {
      console.log('=== DEVELOPMENT EMAIL LOG ===');
      console.log('To:', email);
      console.log('Subject:', mailOptions.subject);
      console.log('Verification URL:', verificationUrl);
      console.log('Email content logged instead of sent');
      console.log('=== END EMAIL LOG ===');
    }
    
    return {
      success: true,
      messageId: info.messageId || 'dev-message-id',
      previewUrl: null
    };
    
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Flaunt By Nishi Team" <${process.env.EMAIL_FROM || 'noreply@flauntbynishi.com'}>`,
      to: email,
      subject: '🎉 Welcome to Flaunt By Nishi - Your Journey Begins Now!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Flaunt By Nishi</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #2B463C, #688F4E);
              color: white;
              text-align: center;
              padding: 30px;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #688F4E, #2B463C);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 25px;
              font-weight: bold;
              margin: 20px 0;
            }
            .feature {
              background: white;
              padding: 20px;
              margin: 15px 0;
              border-radius: 8px;
              border-left: 4px solid #688F4E;
            }
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
              <h3>🏋️ Premium Protein Products</h3>
              <p>Explore our range of high-quality protein shakes and supplements.</p>
            </div>
            
            <div class="feature">
              <h3>⚡ Evolv Points Rewards</h3>
              <p>Earn points with every purchase and redeem them for discounts on future orders.</p>
            </div>
            
            <div class="feature">
              <h3>🎯 Tier-Based Benefits</h3>
              <p>Unlock Bronze, Silver, and Gold tiers for exclusive benefits and higher reward rates.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://flauntbynishi.com'}" class="button">Start Shopping</a>
            </div>
            
            <p>Ready to power up your fitness journey? Browse our products and make your first order!</p>
            
            <p>Best regards,<br>The Flaunt By Nishi Team</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
    
  } catch (error) {
    console.error('Welcome email sending error:', error);
    // Don't throw error for welcome email as it's not critical
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  try {
    const transporter = createTransporter();

    const resetUrl = `${process.env.FRONTEND_URL || 'https://flauntbynishi.com'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Flaunt By Nishi Team" <${process.env.EMAIL_FROM || 'noreply@flauntbynishi.com'}>`,
      to: email,
      subject: 'Reset your Flaunt By Nishi password',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; }
            .button { display:inline-block; padding:12px 20px; background:#2B463C; color:#fff; border-radius:6px; text-decoration:none; }
          </style>
        </head>
        <body>
          <h2>Hi ${firstName || ''},</h2>
          <p>We received a request to reset your password. Click the button below to set a new password. This link will expire in 10 minutes.</p>
          <p style="text-align:center;"><a href="${resetUrl}" class="button">Reset your password</a></p>
          <p>If the button doesn't work, copy and paste the link below into your browser:</p>
          <p style="word-break:break-all;">${resetUrl}</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>— The Flaunt By Nishi Team</p>
        </body>
        </html>
      `,
      text: `Hi ${firstName || ''},\n\nUse the following link to reset your password (expires in 10 minutes):\n\n${resetUrl}\n\nIf you didn't request this, ignore this message.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId || 'dev-message-id');

    if (process.env.NODE_ENV !== 'production') {
      console.log('=== PASSWORD RESET EMAIL LOG ===');
      console.log('To:', email);
      console.log('Reset URL:', resetUrl);
      console.log('=== END EMAIL LOG ===');
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Password reset email error:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};

// Send order cancellation email
const sendOrderCancellationEmail = async (email, firstName, order) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Flaunt By Nishi Team" <${process.env.EMAIL_FROM || 'noreply@flauntbynishi.com'}>`,
      to: email,
      subject: `Your order ${order.orderNumber || ''} has been cancelled`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
          <div style="background:linear-gradient(135deg,#B5A084,#688F4E); color:#fff; padding:20px; border-radius:8px; text-align:center;">
            <h2 style="margin:0">Order Cancelled</h2>
          </div>
          <div style="background:#fff; padding:20px; border-radius:8px; margin-top:12px;">
            <p>Hi ${firstName || ''},</p>
            <p>We're writing to confirm that your order <strong>${order.orderNumber || ''}</strong> has been cancelled.</p>
            ${order.cancellationReason ? `<p><strong>Reason:</strong> ${order.cancellationReason}</p>` : ''}
            <h4>Order Summary</h4>
            <ul>
              ${order.items && order.items.length > 0 ? order.items.map(item => `<li>${item.quantity} × ${item.product?.name || item.name || 'Item'} — ₹${(item.price || 0).toFixed ? (item.price).toFixed(2) : item.price}</li>`).join('') : '<li>No items</li>'}
            </ul>
            <p><strong>Total refunded (if applicable):</strong> ₹${(order.total || 0).toFixed ? (order.total).toFixed(2) : order.total}</p>
            <p>If you have any questions, reply to this email or contact our support.</p>
            <p>Best regards,<br/>Flaunt By Nishi Team</p>
          </div>
        </div>
      `,
      text: `Hi ${firstName || ''},\n\nYour order ${order.orderNumber || ''} has been cancelled.\n\nIf you have questions, contact support.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order cancellation email sent:', info.messageId || 'dev-message-id');
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order cancellation email:', error);
    return { success: false, error: error.message };
  }
};

// Export the new function
module.exports.sendOrderCancellationEmail = sendOrderCancellationEmail;

// Export transporter creator for other modules that may want to send custom emails
module.exports.createTransporter = createTransporter;
