import Attendance from "~/server/models/attendance/attendance.schema";

export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params;

    const deleted = await Attendance.findByIdAndDelete(id);
    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: "Attendance not found",
      });
    }

    return {
      success: true,
      message: "Attendance removed successfully",
    };
  } catch (err) {
    throw createError({ statusCode: 500, statusMessage: err.message });
  }
});
