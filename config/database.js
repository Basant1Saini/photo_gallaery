const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * @param {string} uri - MongoDB connection string (defaults to localhost)
 * @returns {Promise} - Mongoose connection promise
 */
const connectDB = (uri = 'mongodb://localhost:27017/photo-gallery') => {
  return mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected successfully');
    return mongoose.connection;
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
};

// Connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

// Handle application termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;

