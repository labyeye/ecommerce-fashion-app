const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
} = require("../utils/emailService");
const crypto = require("crypto");
const axios = require("axios");

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Set token in cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user: user.getPublicProfile(),
  });
};

// OTP support: send and verify (Email-based)
const Otp = require("../models/Otp");

// POST /api/auth/send-otp
// Supports email-based OTP (existing) and phone-based OTP via Twilio Verify.
router.post(
  "/send-otp",
  [
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("phone")
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Please provide a valid phone number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, phone } = req.body;

      // Phone-based OTP via Twilio Verify
      if (phone) {
        // Require Twilio config
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
        if (!accountSid || !authToken || !serviceSid) {
          return res
            .status(500)
            .json({ success: false, message: "Twilio not configured" });
        }

        const url = `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`;
        try {
          const params = new URLSearchParams();
          params.append("To", phone);
          params.append("Channel", "sms");

          await axios.post(url, params.toString(), {
            auth: { username: accountSid, password: authToken },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });

          return res.json({ success: true, message: "OTP sent to phone" });
        } catch (twErr) {
          console.error(
            "Twilio send error:",
            twErr.response?.data || twErr.message || twErr
          );

          // If Twilio trial account blocks unverified numbers (21608) and
          // developer fallback is enabled, create a dev OTP record so testing
          // can proceed without sending SMS. Controlled via env var.
          const twCode = twErr.response?.data?.code;
          const allowFallback =
            process.env.TWILIO_DEV_FALLBACK === "true" ||
            process.env.NODE_ENV !== "production";
          if (twCode === 21608 && allowFallback) {
            try {
              // create a 6-digit code and store it for phone
              const code = Math.floor(
                100000 + Math.random() * 900000
              ).toString();
              const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
              await Otp.updateMany({ phone, used: false }, { used: true });
              await Otp.create({ phone, code, expiresAt, type: "phone-login" });
              // Return the code in the response only in dev mode (for local testing)
              const payload = {
                success: true,
                message: "OTP (dev) generated for phone",
              };
              if (process.env.NODE_ENV !== "production") payload.code = code;
              return res.json(payload);
            } catch (err2) {
              console.error("Fallback OTP generation failed:", err2);
              return res.status(500).json({
                success: false,
                message: "Failed to generate dev OTP",
              });
            }
          }

          return res
            .status(500)
            .json({ success: false, message: "Failed to send OTP via SMS" });
        }
      }

      // Fallback to email-based OTP (existing behavior)
      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "email or phone is required" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Generate 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Expire in 5 minutes
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Save otp (invalidate previous for this email)
      await Otp.updateMany(
        { email: normalizedEmail, used: false },
        { used: true }
      );
      await Otp.create({
        email: normalizedEmail,
        code,
        expiresAt,
        type: "login",
      });

      // Find user to get firstName
      const user = await User.findOne({ email: normalizedEmail });

      // Send OTP via email
      try {
        await sendOTPEmail(normalizedEmail, code, user?.firstName || "");
      } catch (sendErr) {
        console.error("Email send error:", sendErr);
        return res
          .status(500)
          .json({ success: false, message: "Failed to send OTP email" });
      }

      res.json({ success: true, message: "OTP sent to your email" });
    } catch (error) {
      console.error("send-otp error:", error);
      res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
  }
);

// POST /api/auth/verify-otp
// Supports email-based OTP and phone-based OTP via Twilio Verify
router.post(
  "/verify-otp",
  [
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("phone")
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Please provide a valid phone number"),
    body("code").notEmpty().withMessage("OTP code is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, phone, code } = req.body;

      // Phone-based verification using Twilio
      if (phone) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
        if (!accountSid || !authToken || !serviceSid) {
          return res
            .status(500)
            .json({ success: false, message: "Twilio not configured" });
        }

        const url = `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`;
        try {
          const params = new URLSearchParams();
          params.append("To", phone);
          params.append("Code", code);

          const resp = await axios.post(url, params.toString(), {
            auth: { username: accountSid, password: authToken },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });

          const status = resp.data?.status;
          if (status !== "approved") {
            return res
              .status(400)
              .json({ success: false, message: "Invalid or expired OTP" });
          }

          // Find user by phone
          let user = await User.findOne({ phone });
          if (user) {
            return sendTokenResponse(user, 200, res);
          }

          // Do NOT auto-create user for phone sign-in. If the phone is not
          // registered, inform the frontend so it can offer registration.
          return res.json({
            success: true,
            userExists: false,
            message: "Phone not registered, Create Account using Email Address",
          });
        } catch (twErr) {
          console.error(
            "Twilio verify error:",
            twErr.response?.data || twErr.message || twErr
          );

          const twCode = twErr.response?.data?.code;
          const allowFallback =
            process.env.TWILIO_DEV_FALLBACK === "true" ||
            process.env.NODE_ENV !== "production";
          if (twCode === 21608 && allowFallback) {
            // Trial account blocked sending/verification; try DB fallback
            try {
              const otpRec = await Otp.findOne({
                phone,
                code,
                used: false,
                expiresAt: { $gt: new Date() },
              }).sort({ createdAt: -1 });
              if (!otpRec) {
                return res.status(400).json({
                  success: false,
                  message: "Invalid or expired OTP (dev fallback)",
                });
              }
              otpRec.used = true;
              await otpRec.save();

              let user = await User.findOne({ phone });
              if (user) {
                return sendTokenResponse(user, 200, res);
              }
              // Do not auto-create user in dev fallback either; inform frontend
              return res.json({
                success: true,
                userExists: false,
                message: "Phone not registered",
              });
            } catch (fbErr) {
              console.error("Dev fallback verify error:", fbErr);
              return res.status(500).json({
                success: false,
                message: "Failed to verify OTP (dev fallback)",
              });
            }
          }

          return res
            .status(500)
            .json({ success: false, message: "Failed to verify OTP" });
        }
      }

      // Fallback to email-based OTP (existing behavior)
      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "email or phone is required" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const otp = await Otp.findOne({
        email: normalizedEmail,
        code,
        used: false,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (!otp) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      // Mark used
      otp.used = true;
      await otp.save();

      // Find user by email
      const user = await User.findOne({ email: normalizedEmail });
      if (user) {
        // Existing user: login
        return sendTokenResponse(user, 200, res);
      }

      // New email: auto-create a user (email verified via OTP) and return JWT
      try {
        const randomPassword = crypto.randomBytes(12).toString("hex");
        const newUser = await User.create({
          firstName: "Email",
          lastName: "User",
          email: normalizedEmail,
          password: randomPassword,
          phone: "",
          role: "customer",
          isEmailVerified: true,
        });

        // Send welcome email (best-effort)
        try {
          await sendWelcomeEmail(newUser.email, newUser.firstName);
        } catch (weErr) {
          console.warn(
            "Failed to send welcome email to new OTP user:",
            weErr && weErr.message ? weErr.message : weErr
          );
        }

        // Return token and user, mark as new
        const token = generateToken(newUser._id);
        const options = {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        };
        res.cookie("token", token, options).status(201).json({
          success: true,
          token,
          user: newUser.getPublicProfile(),
          isNew: true,
        });
        return;
      } catch (createErr) {
        console.error("Failed to auto-create user from email OTP:", createErr);
        return res
          .status(500)
          .json({ success: false, message: "Failed to create user" });
      }
    } catch (error) {
      console.error("verify-otp error:", error);
      res
        .status(500)
        .json({ success: false, message: "OTP verification failed" });
    }
  }
);

// POST /api/auth/register-with-otp
router.post(
  "/register-with-otp",
  [
    body("tempToken").notEmpty().withMessage("tempToken is required"),
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { tempToken, firstName, lastName, password, phone } = req.body;
      let payload;
      try {
        payload = jwt.verify(tempToken, process.env.JWT_SECRET);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired temp token" });
      }

      if (!payload || !payload.email || !payload.otpVerified) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid temp token payload" });
      }

      const email = payload.email;

      // Check again if user exists
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        phone: phone || "",
        role: "customer",
        isEmailVerified: true, // Email verified via OTP
      });

      // Send welcome email
      try {
        await sendWelcomeEmail(email, firstName);
      } catch (err) {
        console.warn("Failed to send welcome email:", err.message);
      }

      // Return JWT
      sendTokenResponse(user, 201, res);
    } catch (error) {
      console.error("register-with-otp error:", error);
      res.status(500).json({ success: false, message: "Registration failed" });
    }
  }
);

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post(
  "/register",
  [
    body("firstName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("phone")
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Please provide a valid phone number"),
  ],
  async (req, res) => {
    try {
      console.log("Registration request received:", {
        body: req.body,
        headers: req.headers,
        origin: req.headers.origin,
      });

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { firstName, lastName, email, password, phone, address } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        phone,
        address,
        role: "customer", // Default role for registration
        isEmailVerified: false, // Email not verified yet
      });

      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Send verification email
      try {
        await sendVerificationEmail(
          user.email,
          user.firstName,
          verificationToken
        );

        console.log("User created successfully:", {
          id: user._id,
          email: user.email,
          role: user.role,
          emailVerified: user.isEmailVerified,
        });

        res.status(201).json({
          success: true,
          message:
            "Registration successful! Please check your email to verify your account.",
          data: {
            user: {
              id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              isEmailVerified: user.isEmailVerified,
            },
          },
        });
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);

        // Delete the user if email sending fails
        await User.findByIdAndDelete(user._id);

        return res.status(500).json({
          success: false,
          message:
            "Registration failed. Unable to send verification email. Please try again.",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      res.status(500).json({
        success: false,
        message: "Error creating user",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
router.post(
  "/verify-email",
  [body("token").notEmpty().withMessage("Verification token is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { token } = req.body;

      // Find user with matching verification token and not expired
      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() },
        isEmailVerified: false,
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification token",
        });
      }

      // Verify email and clear verification token
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      // Send welcome email
      await sendWelcomeEmail(user.email, user.firstName);

      console.log("Email verified successfully for user:", user.email);

      // Send JWT token after verification
      sendTokenResponse(user, 200, res);
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({
        success: false,
        message: "Error verifying email",
      });
    }
  }
);

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
router.post(
  "/resend-verification",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email } = req.body;

      // Find unverified user
      const user = await User.findOne({
        email,
        isEmailVerified: false,
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found or already verified",
        });
      }

      // Generate new verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Send verification email
      await sendVerificationEmail(
        user.email,
        user.firstName,
        verificationToken
      );

      res.status(200).json({
        success: true,
        message: "Verification email sent successfully",
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({
        success: false,
        message: "Error sending verification email",
      });
    }
  }
);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findByEmail(email).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check if email is verified (only for customers, not admin)
      if (user.role === "customer" && !user.isEmailVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email address before logging in",
          requiresVerification: true,
          email: user.email,
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated. Please contact support.",
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      sendTokenResponse(user, 200, res);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Error during login",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post("/logout", protect, async (req, res) => {
  try {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000), // 10 seconds
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user data",
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put(
  "/profile",
  protect,
  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("phone")
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Please provide a valid phone number"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { firstName, lastName, phone, address } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (address) user.address = address;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: user.getPublicProfile(),
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating profile",
      });
    }
  }
);

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put(
  "/change-password",
  protect,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.id).select("+password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Error changing password",
      });
    }
  }
);

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User with this email does not exist",
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      await user.save();

      // Send password reset email (unhashed token is sent to user)
      try {
        await sendPasswordResetEmail(user.email, user.firstName, resetToken);
        res.status(200).json({
          success: true,
          message: "Password reset email sent",
        });
      } catch (emailErr) {
        console.error("Failed to send password reset email:", emailErr);
        // Clear tokens on failure
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return res.status(500).json({
          success: false,
          message: "Failed to send password reset email",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Error processing forgot password request",
      });
    }
  }
);

// @desc    Reset password (set new password using token)
// @route   POST /api/auth/reset-password
// @access  Public
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { token, password } = req.body;

      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // Find user with matching token and not expired
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      }).select("+password");

      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired reset token" });
      }

      // Set new password and clear reset token fields
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res
        .status(500)
        .json({ success: false, message: "Error resetting password" });
    }
  }
);

// @desc    Google Sign-In with ID Token
// @route   POST /api/auth/google
// @access  Public
router.post(
  "/google",
  [body("idToken").notEmpty().withMessage("Google ID token is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { idToken } = req.body;

      // Verify the Google ID token
      let googleUser;
      try {
        const response = await axios.get(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
        );
        googleUser = response.data;

        // Verify the token is for our app
        if (googleUser.aud !== process.env.GOOGLE_CLIENT_ID) {
          return res.status(401).json({
            success: false,
            message: "Invalid token audience",
          });
        }
      } catch (error) {
        console.error(
          "Google token verification error:",
          error.response?.data || error.message
        );
        return res.status(401).json({
          success: false,
          message: "Invalid Google token",
        });
      }

      // Check if user exists with this Google ID
      let user = await User.findOne({ googleId: googleUser.sub });

      if (!user) {
        // Check if email already exists
        user = await User.findOne({ email: googleUser.email });

        if (user) {
          // Link Google account to existing user
          user.googleId = googleUser.sub;
          user.isEmailVerified = true;
          await user.save();
        } else {
          // Create new user
          const nameParts = googleUser.name?.split(" ") || ["User", ""];
          user = await User.create({
            googleId: googleUser.sub,
            firstName: nameParts[0] || googleUser.given_name || "User",
            lastName:
              nameParts.slice(1).join(" ") || googleUser.family_name || "",
            email: googleUser.email,
            isEmailVerified: true,
            role: "customer",
            password: crypto.randomBytes(32).toString("hex"), // Random password for OAuth users
          });

          // Send welcome email
          try {
            await sendWelcomeEmail(user.email, user.firstName);
          } catch (err) {
            console.warn("Failed to send welcome email:", err.message);
          }
        }
      }

      // Generate JWT and send response
      sendTokenResponse(user, 200, res);
    } catch (error) {
      console.error("Google sign-in error:", error);
      res.status(500).json({
        success: false,
        message: "Google sign-in failed",
      });
    }
  }
);

module.exports = router;
