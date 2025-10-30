// server/api/v1/meal/index.post.js
import Meal from "~/server/models/meal/index.js";
import Attendance from "~/server/models/attendance/index.js";
import User from "~/server/models/user/index.js";
import { requireAdmin } from "~/server/utils/auth.js";

export default defineEventHandler(async (event) => {
  try {
    // ✅ Require admin
    await requireAdmin(event);

    // 1️⃣ Read and validate body
    const body = await readBody(event);

    // Destructure to explicitly include the new 'notes' field
    const { date, description, totalCost, notes } = body;

    // 2️⃣ Create Meal (with notes)
    const meal = await Meal.create({
      date,
      description,
      totalCost,
      notes: notes || "", // fallback for empty notes
    });

    // 3️⃣ Fetch all users
    const users = await User.find().lean();

    // 4️⃣ Build attendees array
    const attendees = users.map((user) =>
      user.active
        ? { userId: user._id, mealCount: 1 }
        : { userId: user._id, mealCount: 0 }
    );

    // 5️⃣ Create one Attendance doc for this meal
    const attendance = await Attendance.create({
      mealId: meal._id,
      attendees,
    });

    // 6️⃣ Return combined response
    return {
      success: true,
      data: {
        ...meal.toObject(),
        attendees: attendance.attendees,
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
