require('dotenv').config();
const mongoose = require('mongoose');

async function checkConnection() {
  console.log('Attempting to connect to MongoDB...');
  console.log('URI:', process.env.MONGO_URI.replace(/\/\/.*@/, '//****:****@')); // Hide credentials
  
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed!`);
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

checkConnection();
