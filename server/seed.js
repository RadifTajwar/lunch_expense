import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user/index.js"; // ✅ make sure "User" has the correct case

// 🔑 Load environment variables from .env
dotenv.config();

async function seed() {
  try {
    // 🔗 Connect to MongoDB
    console.log("🔗 Connecting to MongoDB...", process.env.MONGO_URI);
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "lunch_expense", // can be omitted if already in URI
    });
    console.log("✅ Connected to MongoDB");

    // 🗑️ Clear old users
    await User.deleteMany({});
    console.log("🗑️ Cleared existing users");

    // 🌱 Insert sample users
    const users = await User.insertMany([
      { name: "Admin User", email: "admin@example.com", role: "admin" },
      { name: "Member One", email: "member1@example.com", role: "member" },
      { name: "Member Two", email: "member2@example.com", role: "member" },
    ]);

    console.log("🌱 Seeded users:", users);

    // ✅ Test static method
    const check = await User.findByEmail("admin@example.com");
    console.log("🔍 Found user via static:", check);

    // ✅ Done
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seed();
