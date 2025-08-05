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
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: `"Vitals Team" <${process.env.EMAIL_FROM || 'noreply@vitals.com'}>`,
      to: email,
      subject: 'Verify Your Email Address - Vitals',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
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
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to Vitals!</h1>
            <p>Thanks for joining our protein-powered community</p>
          </div>
          
          <div class="content">
            <h2>Hi ${firstName}!</h2>
            
            <p>Welcome to Vitals! We're excited to have you as part of our community.</p>
            
            <p>To complete your registration and start your fitness journey with us, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>This verification link will expire in 24 hours for security reasons.</p>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #688F4E;">${verificationUrl}</p>
            
            <p>If you didn't create an account with Vitals, you can safely ignore this email.</p>
            
            <p>Best regards,<br>The Vitals Team</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Vitals. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${firstName}!
        
        Welcome to Vitals! We're excited to have you as part of our community.
        
        To complete your registration, please verify your email address by visiting this link:
        ${verificationUrl}
        
        This verification link will expire in 24 hours for security reasons.
        
        If you didn't create an account with Vitals, you can safely ignore this email.
        
        Best regards,
        The Vitals Team
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
      from: `"Vitals Team" <${process.env.EMAIL_FROM || 'noreply@vitals.com'}>`,
      to: email,
      subject: '🎉 Welcome to Vitals - Your Journey Begins Now!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Vitals</title>
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
            <h1>🎉 Welcome to Vitals!</h1>
            <p>Your email has been verified successfully</p>
          </div>
          
          <div class="content">
            <h2>Hi ${firstName}!</h2>
            
            <p>Congratulations! Your email has been verified and your Vitals account is now active.</p>
            
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
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Start Shopping</a>
            </div>
            
            <p>Ready to power up your fitness journey? Browse our products and make your first order!</p>
            
            <p>Best regards,<br>The Vitals Team</p>
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

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail
};
