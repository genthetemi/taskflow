const mongoose = require('mongoose');

const connectMongo = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('MONGO_URI is not set. MongoDB features are disabled.');
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGO_DB_NAME || undefined
  });

  console.log('MongoDB connected');
  return true;
};

module.exports = {
  connectMongo,
  mongoose
};