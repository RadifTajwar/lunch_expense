// server/api/v1/meal/[id].delete.js
import Meal from "~/server/models/meal/index.js";
import Attendance from "~/server/models/attendance/index.js";
import { requireAdmin } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    // ✅ Only admins can delete meals
    await requireAdmin(event);

    const id = getRouterParam(event, "id");

    // 🔥 Hard delete meal
    const meal = await Meal.findByIdAndDelete(id);

    if (!meal) {
      throw createError({
        statusCode: 404,
        statusMessage: "Meal not found",
      });
    }

    // 🗑️ Also delete attendance records for this meal
    await Attendance.deleteMany({ mealId: id });

    return {
      success: true,
      message: "Meal and related attendance records deleted successfully",
    };
  } catch (err) {
    console.error("❌ Error deleting meal:", err);
    throw createError({
      statusCode: 500,
      statusMessage: err.message || "Server error",
    });
  }
});
