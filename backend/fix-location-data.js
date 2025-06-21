const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

async function printUser() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const user = await mongoose.connection.collection('users').findOne({ email: 'naitikv2311@gmail.com' });
  console.log('User document:', user);

  await mongoose.connection.close();
  console.log('Done. Database connection closed.');
}

printUser().catch(err => {
  console.error('Error printing user:', err);
  process.exit(1);
}); 