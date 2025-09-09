import mongoose from "mongoose";
import Meal from "../models/meal/index.js";
import Attendance from "../models/attendance/index.js";
import User from "../models/user/index.js"; // assuming you already have users
import dotenv from "dotenv";
dotenv.config();
async function seed() {
  console.log("🔄 Starting seeding process...", process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Meal.deleteMany({});
    await Attendance.deleteMany({});

    // Fetch some users (make sure you have users already)
    const users = await User.find().limit(3);
    if (users.length === 0) {
      console.log("❌ No users found. Please seed users first.");
      process.exit(1);
    }

    // Create meals
    const meals = await Meal.insertMany([
      {
        date: new Date("2025-09-01"),
        description: "Chicken Curry with Rice",
        totalCost: 600,
      },
      {
        date: new Date("2025-09-02"),
        description: "Fish Fry with Dal",
        totalCost: 550,
      },
    ]);

    console.log("✅ Meals seeded:", meals.length);

    // Create attendance (assign users randomly to meals)
    const attendanceData = [
      { mealId: meals[0]._id, userId: users[0]._id },
      { mealId: meals[0]._id, userId: users[1]._id },
      { mealId: meals[1]._id, userId: users[1]._id },
      { mealId: meals[1]._id, userId: users[2]._id },
    ];

    const attendance = await Attendance.insertMany(attendanceData);
    console.log("✅ Attendance seeded:", attendance.length);

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
