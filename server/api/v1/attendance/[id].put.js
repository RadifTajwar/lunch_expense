// server/api/v1/attendance/[id].put.js
import Attendance from "~/server/models/attendance/index.js";
import Meal from "~/server/models/meal/index.js";

export default defineEventHandler(async (event) => {
  try {
    const mealId = getRouterParam(event, "id"); // mealId comes from [id].put.js
    const body = await readBody(event);
    // body should look like: [{ userId, mealCount, checked }, ...]

    // Find attendance doc for this meal
    let attendance = await Attendance.findOne({ mealId });
    if (!attendance) {
      throw createError({
        statusCode: 404,
        statusMessage: "Attendance not found for this meal",
      });
    }

    // Update attendees inside attendance.attendees
    body.forEach((update) => {
      const existing = attendance.attendees.find(
        (a) => String(a.userId) === String(update.userId)
      );

      if (update.checked) {
        if (existing) {
          // ✅ Update mealCount
          existing.mealCount = update.mealCount;
        } else {
          // ✅ Add new attendee
          attendance.attendees.push({
            userId: update.userId,
            mealCount: update.mealCount,
          });
        }
      } else {
        // ❌ Remove attendee if unchecked
        attendance.attendees = attendance.attendees.filter(
          (a) => String(a.userId) !== String(update.userId)
        );
      }
    });

    await attendance.save();

    // 🔄 Re-fetch updated meal
    const meal = await Meal.findById(mealId).lean();

    // Populate attendees
    const populated = await Attendance.findOne({ mealId })
      .populate("attendees.userId", "name email")
      .lean();

    const mealWithAttendance = {
      ...meal,
      attendees:
        populated?.attendees.map((a) => ({
          userId: a.userId?._id,
          name: a.userId?.name,
          email: a.userId?.email,
          mealCount: a.mealCount,
        })) || [],
    };

    return {
      success: true,
      message: "Attendances updated successfully",
      data: mealWithAttendance,
    };
  } catch (err) {
    console.error("❌ Error updating attendances:", err);
    throw createError({ statusCode: 500, statusMessage: err.message });
  }
});
