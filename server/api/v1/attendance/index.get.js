import Attendance from "~/server/models/attendance/attendance.schema";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const filter = {};
    if (query.mealId) filter.mealId = query.mealId;
    if (query.userId) filter.userId = query.userId;

    const attendance = await Attendance.find(filter)
      .populate("mealId")
      .populate("userId");

    return {
      success: true,
      data: attendance,
    };
  } catch (err) {
    throw createError({ statusCode: 500, statusMessage: err.message });
  }
});
