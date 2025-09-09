// server/api/v1/meal/index.post.js
import Meal from "~/server/models/meal/index.js";
import Attendance from "~/server/models/attendance/index.js";
import User from "~/server/models/user/index.js";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // 1️⃣ Create Meal
    const meal = await Meal.create(body);

    // 2️⃣ Fetch all users
    const users = await User.find().lean();

    // 3️⃣ Build attendees array
    const attendees = users.map((user) => ({
      userId: user._id,
      mealCount: 1, // default
    }));

    // 4️⃣ Create one Attendance doc for this meal
    const attendance = await Attendance.create({
      mealId: meal._id,
      attendees,
    });

    return {
      success: true,
      data: {
        ...meal.toObject(),
        attendees: attendance.attendees, // 👈 merged directly
      },
    };
  } catch (err) {
    console.error("❌ Error creating meal:", err);
    throw createError({
      statusCode: 400,
      statusMessage: err.message,
    });
  }
});
