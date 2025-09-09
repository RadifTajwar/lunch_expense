// server/api/v1/meal/[id].put.js
import Meal from "~/server/models/meal/index.js";
import Attendance from "~/server/models/attendance/index.js";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id"); // mealId
    const body = await readBody(event);

    // 🔄 Update meal
    const meal = await Meal.findByIdAndUpdate(id, body, {
      new: true,
      lean: true, // return plain object
    });

    if (!meal) {
      throw createError({
        statusCode: 404,
        statusMessage: "Meal not found",
      });
    }

    // 👥 Fetch attendance doc for this meal
    const attendance = await Attendance.findOne({ mealId: id })
      .populate("attendees.userId", "name email")
      .lean();

    // Attach attendance like in GET
    const mealWithAttendance = {
      ...meal,
      attendees:
        attendance?.attendees.map((att) => ({
          userId: att.userId?._id,
          name: att.userId?.name,
          email: att.userId?.email,
          mealCount: att.mealCount,
        })) || [],
    };

    return {
      success: true,
      data: mealWithAttendance,
    };
  } catch (err) {
    console.error("❌ Error updating meal:", err);
    throw createError({
      statusCode: 400,
      statusMessage: err.message,
    });
  }
});
