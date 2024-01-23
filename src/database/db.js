const mongoose = require("mongoose");
require("dotenv").config();
const uri = process.env.MONGO_DB_URL;

// Creating connection function
const connectDB = async () => {
  try {
    mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (err) {
    // if (err) return err.message;
    console.log(err.message);
  }
};

module.exports = connectDB;
