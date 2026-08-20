const mongoose = require("mongoose");
const dns = require("dns");

// Windows/campus Wi-Fi এর কিছু নেটওয়ার্কে MongoDB Atlas এর SRV record
// resolve করতে সমস্যা হয় (querySrv ECONNREFUSED)। এই লাইনটা Node কে
// বাধ্য করে Google এর DNS ব্যবহার করতে, Windows এর নিজের DNS setting যাই হোক না কেন।
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;