const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/vitals_db');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitals_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({ name: String });
    const Test = mongoose.model('Test', TestSchema);
    
    const testDoc = new Test({ name: 'test' });
    await testDoc.save();
    console.log('✅ Database write test successful!');
    
    await Test.deleteOne({ name: 'test' });
    console.log('✅ Database delete test successful!');
    
    await mongoose.disconnect();
    console.log('✅ All tests passed! Database is working correctly.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection(); 