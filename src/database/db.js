const mongoose = require("mongoose");
require("dotenv").config();
const uri = process.env.MONGO_DB_URL;

// Creating connection function
const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = connectDB;
