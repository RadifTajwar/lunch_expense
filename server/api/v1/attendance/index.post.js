// server/api/v1/attendance/index.post.js
import Attendance from "~/server/models/attendance/attendance.schema";
import { requireAdmin } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    // ✅ Only admins can create attendance
    await requireAdmin(event);

    const body = await readBody(event);

    if (!body.mealId || !body.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "mealId and userId are required",
      });
    }

    const attendance = await Attendance.create(body);

    return {
      success: true,
      message: "Attendance added successfully",
      data: attendance,
    };
  } catch (err) {
    throw createError({ statusCode: 500, statusMessage: err.message });
  }
});
