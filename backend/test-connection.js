const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

async function testConnection() {
  console.log('=== TESTING BACKEND CONNECTION ===');
  
  // Test environment variables
  console.log('1. Testing environment variables...');
  console.log('PORT:', process.env.PORT);
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // Test MongoDB connection
  console.log('\n2. Testing MongoDB connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
    console.log('Database name:', mongoose.connection.name);
    console.log('Database host:', mongoose.connection.host);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
  
  // Test JWT token generation
  console.log('\n3. Testing JWT token generation...');
  try {
    const testUserId = '507f1f77bcf86cd799439011'; // Test ObjectId
    const token = jwt.sign({ userId: testUserId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ JWT token generated successfully');
    console.log('Token length:', token.length);
    
    // Test token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT token verified successfully');
    console.log('Decoded userId:', decoded.userId);
  } catch (error) {
    console.error('❌ JWT token generation failed:', error.message);
    process.exit(1);
  }
  
  // Test User model
  console.log('\n4. Testing User model...');
  try {
    const User = require('./models/User');
    console.log('✅ User model loaded successfully');
    
    // Test creating a user instance (without saving)
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ User instance created successfully');
    console.log('User ID:', testUser._id);
  } catch (error) {
    console.error('❌ User model test failed:', error.message);
    process.exit(1);
  }
  
  console.log('\n=== ALL TESTS PASSED ===');
  console.log('Backend is ready to run!');
  
  // Close connection
  await mongoose.connection.close();
  process.exit(0);
}

testConnection().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
}); 