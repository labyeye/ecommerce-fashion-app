const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://flauntbynishi_db_user:nYHebBsLgUEfYE7j@main.tj7h1ns.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      firstName: 'Flauntbynishi',
      lastName: 'Admin',
      email: 'admin@flauntbynishi.com',
      password: 'admin123456',
      role: 'admin',
      phone: '+919876543210',
      address: {
        street: 'Fashion District',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      isActive: true,
      isEmailVerified: true  // Pre-verified for admin - no email verification needed
    };

    const admin = await User.create(adminData);

    console.log('Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123456');
    console.log('Please change the password after first login.');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdminUser(); 