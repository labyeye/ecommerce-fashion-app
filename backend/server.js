const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const customerRoutes = require('./routes/customer');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const categoryRoutes = require('./routes/category');
const navigationRoutes = require('./routes/navigation');
const paymentRoutes = require('./routes/payments');
const heroRoutes = require('./routes/heroes');
const blogRoutes = require('./routes/blogs');

const app = express();
const PORT = process.env.PORT || 3500;

// Security middleware
app.use(helmet());

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 500, // More requests in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration - Allow dashboard and website origins for development
app.use(cors({
    origin: [
      'http://localhost:5173', // Vite default for dashboard
      'http://localhost:5174', // Vite default for website (if used)
      'http://localhost:3000', // React default (if used)
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'https://ecommerce-fashion-app.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','HEAD'],
    allowedHeaders: [
      'Accept',
      'Accept-Language',
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'x-auth-token',
      'Origin',
      'Cache-Control',
      'Pragma'
    ],
    exposedHeaders: ['Set-Cookie', 'Date', 'ETag', 'Content-type']
  }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploaded images with explicit CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Set Cross-Origin-Resource-Policy header to allow cross-origin access
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Set additional security headers for images
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  require('./models/User'); // Make sure you have this file
  require('./models/Category');
  require('./models/Product');
  require('./models/NavigationLink');
})
.catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/heroes', heroRoutes);
app.use('/api/blogs', blogRoutes);
app.get('/api/health', (req, res) => {
  console.log('Health check request received from:', req.headers.origin);
  res.json({ 
    status: 'OK', 
    message: 'Vitals API is running',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
}); 