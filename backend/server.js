const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const customerRoutes = require("./routes/customer");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const categoryRoutes = require("./routes/category");
const navigationRoutes = require("./routes/navigation");
const paymentRoutes = require("./routes/payments");
const heroRoutes = require("./routes/heroes");
const blogRoutes = require("./routes/blogs");
const wishlistRoutes = require("./routes/wishlist");
const reviewsRoutes = require("./routes/reviews");
const shippingRoutes = require("./routes/shipping");
const activityRoutes = require("./routes/activity");
const contactRoutes = require("./routes/contact");
const jobRoutes = require("./routes/jobs");

const app = express();
const PORT = process.env.PORT || 3500;
const trustProxyEnabled =
  process.env.TRUST_PROXY === "true" ||
  process.env.TRUST_PROXY === "1" ||
  process.env.VERCEL === "1" ||
  process.env.NODE_ENV === "production";
if (trustProxyEnabled) {
  // Use a single trusted proxy hop by default (common for many platforms)
  app.set("trust proxy", 1);
  console.log("Express trust proxy enabled (1)");
} else {
  console.log("Express trust proxy disabled");
}

app.use(
  helmet({
    crossOriginOpenerPolicy: {
      policy: process.env.COOP_POLICY || "same-origin-allow-popups",
    },
  })
);

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 500, // More requests in development
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration - Allow dashboard and website origins for development
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g., server-to-server, curl) with no origin
      if (!origin) return callback(null, true);

      const allowedFullOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://ecommerce-fashion-app.vercel.app",
        "https://ecommerce-fashion-app-dashboard.vercel.app",
        "https://www.flauntbynishi.com",
      ];

      const allowedHosts = [
        "localhost",
        "127.0.0.1",
        "ecommerce-fashion-app.vercel.app",
        "ecommerce-fashion-app-dashboard.vercel.app",
        "flauntbynishi.com",
        "www.flauntbynishi.com",
      ];

      try {
        const parsed = new URL(origin);
        const originHost = parsed.host; // includes port if present
        const originHostname = parsed.hostname; // hostname without port

        if (
          allowedFullOrigins.includes(origin) ||
          allowedHosts.includes(originHostname) ||
          allowedHosts.includes(originHost)
        ) {
          return callback(null, origin);
        }
      } catch (e) {
        // If URL parsing fails, fall back to direct match
        if (allowedFullOrigins.includes(origin)) return callback(null, origin);
      }

      return callback(
        new Error("CORS policy: This origin is not allowed: " + origin)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Allow-Control-Allow-Origin",
      "Access-Control-Allow-Methods",
      "Accept",
      "Accept-Language",
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-CSRF-Token",
      "x-auth-token",
      "Origin",
      "Cache-Control",
      "Pragma",
    ],
    exposedHeaders: ["Set-Cookie", "Date", "ETag", "Content-type"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploaded images with explicit CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    // Set CORS headers
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Set Cross-Origin-Resource-Policy header to allow cross-origin access
    res.header("Cross-Origin-Resource-Policy", "cross-origin");

    // Set additional security headers for images
    res.header("Cross-Origin-Embedder-Policy", "unsafe-none");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Wait up to 10s for server selection (adjust if needed)
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    // require models after successful connection to register schemas
    require("./models/User"); // Make sure you have this file
    require("./models/Category");
    require("./models/Product");
    require("./models/NavigationLink");
    require("./models/Review");
    // Exchange models
    require("./models/ExchangeRequest");
    require("./models/ExchangeStatusLog");
    // Activity log model
    try {
      require("./models/ActivityLog");
    } catch (err) {
      console.warn("ActivityLog model not loaded:", err.message || err);
    }

    // Start periodic Delhivery sync job
    try {
      const { syncOnce } = require("./services/delhiverySyncService");
      const syncIntervalSeconds = Number(
        process.env.DELHIVERY_SYNC_SECONDS || 0
      );
      const syncIntervalMinutes = Number(
        process.env.DELHIVERY_SYNC_MINUTES || 5
      );
      if (syncIntervalSeconds && syncIntervalSeconds > 0) {
        console.log(
          `Starting Delhivery sync job every ${syncIntervalSeconds} seconds`
        );
        // initial run shortly after startup
        setTimeout(() => syncOnce(), 5 * 1000);
        setInterval(() => syncOnce(), syncIntervalSeconds * 1000);
      } else {
        console.log(
          `Starting Delhivery sync job every ${syncIntervalMinutes} minutes`
        );
        setTimeout(() => syncOnce(), 10 * 1000);
        setInterval(() => syncOnce(), syncIntervalMinutes * 60 * 1000);
      }
    } catch (err) {
      console.error("Failed to start Delhivery sync job:", err);
    }

    // Start automatic order cancellation job (runs every hour)
    try {
      const { cancelPendingOrders } = require("./jobs/cancelPendingOrders");
      console.log("Starting automatic order cancellation job (runs hourly)");
      
      // Initial run after 2 minutes of startup
      setTimeout(async () => {
        console.log("Running initial order cancellation check...");
        const result = await cancelPendingOrders();
        console.log("Order cancellation result:", result);
      }, 2 * 60 * 1000);
      
      // Then run every hour
      setInterval(async () => {
        console.log("Running scheduled order cancellation check...");
        const result = await cancelPendingOrders();
        console.log("Order cancellation result:", result);
      }, 60 * 60 * 1000); // Every hour
    } catch (err) {
      console.error("Failed to start order cancellation job:", err);
    }

    // Start Express server only after DB connection is established
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    // Fail fast: exit process when DB connection fails at startup
    // so platforms (PM2, systemd, or container orchestrators) can retry
    process.exit(1);
  });

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/navigation", navigationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/heroes", heroRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/shipping", shippingRoutes);
// Delhivery webhook endpoint for instant carrier updates (cancellations, etc.)
try {
  const delhiveryWebhookRoutes = require("./routes/delhiveryWebhook");
  app.use("/api/shipping/delhivery", delhiveryWebhookRoutes);
} catch (err) {
  console.warn("Delhivery webhook route not mounted:", err.message || err);
}
app.use("/api/activity", activityRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/jobs", jobRoutes);
const exchangeRoutes = require("./routes/exchange");
app.use("/api/exchange", exchangeRoutes);
app.get("/api/health", (req, res) => {
  console.log("Health check request received from:", req.headers.origin);
  res.json({
    status: "OK",
    message: "Vitals API is running",
    timestamp: new Date().toISOString(),
    cors: "enabled",
  });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Mongoose connection events for runtime diagnostics
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected (event)");
});
mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error (event):", err);
});
mongoose.connection.on("disconnected", () => {
  console.warn("Mongoose disconnected");
});

// Optional: disable mongoose command buffering so operations fail fast
// instead of being buffered and timing out. Uncomment to enable.
// mongoose.set('bufferCommands', false);

// If you prefer the old behavior (server starts even if DB is slower to connect),
// keep app.listen outside of the connection promise. Waiting for the DB is
// recommended to avoid buffered/timeout errors like the one you saw.
