// server/api/v1/reports/mealRates.get.js
import Meal from "~/server/models/meal/index";
import Attendance from "~/server/models/attendance/index";

export default defineEventHandler(async () => {
  const now = new Date();
  const last12 = [];

  for (let i = 0; i < 12; i++) {
    const year = now.getFullYear();
    const month = now.getMonth() - i;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    const meals = await Meal.find({
      date: { $gte: startDate, $lt: endDate },
    }).lean();

    const mealIds = meals.map((m) => m._id);
    const attendances = await Attendance.find({
      mealId: { $in: mealIds },
    }).lean();

    let totalUnits = 0;
    let totalCost = 0;

    for (const meal of meals) {
      const mealAttendance = attendances.find(
        (a) => String(a.mealId) === String(meal._id)
      );
      if (!mealAttendance || !mealAttendance.attendees?.length) continue;

      const units = mealAttendance.attendees.reduce(
        (sum, a) => sum + (a.mealCount || 0),
        0
      );
      totalUnits += units;
      totalCost += meal.totalCost;
    }

    last12.unshift({
      month: startDate.toISOString().slice(0, 7), // "YYYY-MM"
      mealRate: totalUnits > 0 ? totalCost / totalUnits : 0,
    });
  }
  return { success: true, data: last12 };
});
