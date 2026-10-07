const mongoose = require('mongoose');

module.exports = async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('mongo connected:', mongoose.connection.name);
  } catch (err) {
    console.error('mongo connection failed:', err.message);
    process.exit(1);
  }
};