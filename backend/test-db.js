const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

async function testDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    // Check if users exist
    const users = await User.find();
    console.log('Users in database:', users.length);
    
    if (users.length === 0) {
      console.log('No users found. Creating test user...');
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      await testUser.save();
      console.log('Test user created successfully');
    } else {
      console.log('Users found:', users.map(u => ({ name: u.name, email: u.email })));
    }
    
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testDatabase(); 