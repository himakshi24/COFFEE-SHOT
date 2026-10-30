const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('MongoDB connection error: MONGO_URI is not defined. Add your Atlas connection string to backend/.env');
    return false;
  }

  if (!/^mongodb(\+srv)?:\/\//i.test(mongoUri)) {
    console.error('Invalid MongoDB URI. Use a value like mongodb+srv://<user>:<password>@cluster0.xxxxxx.mongodb.net/your-db?retryWrites=true&w=majority');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Check your Atlas username/password, network access, and MONGO_URI format.');
    return false;
  }
};

module.exports = connectDB;
