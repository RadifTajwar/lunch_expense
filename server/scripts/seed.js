// server/scripts/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user/index.js";
import AdvancePayment from "../models/AdvancePayment/index.js";

dotenv.config(); // load .env for MONGO_URI

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "lunch_expense",
    });
    console.log("✅ Connected to MongoDB");

    // Clear old data (optional)
    await User.deleteMany({});
    await AdvancePayment.deleteMany({});
    console.log("🧹 Cleared old data");

    // Create some users
    const users = await User.insertMany([
      { name: "Alice", email: "alice@example.com", role: "member" },
      { name: "Bob", email: "bob@example.com", role: "admin" },
      { name: "Charlie", email: "charlie@example.com", role: "member" },
    ]);
    console.log(
      "👤 Inserted users:",
      users.map((u) => u.name)
    );

    // Create some advance payments
    const payments = [
      {
        userId: users[0]._id,
        amount: 1000,
        date: new Date("2025-09-01"),
        tips: 20,
      },
      {
        userId: users[1]._id,
        amount: 1500,
        date: new Date("2025-09-03"),
        tips: 0,
      },
      {
        userId: users[2]._id,
        amount: 1200,
        date: new Date("2025-09-05"),
        tips: 10,
      },
    ];

    await AdvancePayment.insertMany(payments);
    console.log("💰 Inserted advance payments");

    console.log("✅ Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
}

seed();
