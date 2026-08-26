const mongoose = require('mongoose');
const logger = require('./logger');
const env = require('./env');

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}. Retrying in 5 seconds...`);
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;

