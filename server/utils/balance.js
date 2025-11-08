// server/utils/balance.js
import mongoose from "mongoose";
import Advance from "~/server/models/AdvancePayment";
import Attendance from "~/server/models/attendance";
import Meal from "~/server/models/meal";

/**
 * Calculate a user's balance for the current month only.
 * Balance = totalAdvance (this month) - totalExpense (this month)
 * @param {String} userId - MongoDB ObjectId (string)
 * @returns {Number} balance
 */
export async function calculateUserBalance(userId) {
  // 🗓️ Get current month range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // 🥘 Get all meals from current month
  const meals = await Meal.find({
    date: { $gte: startOfMonth, $lt: endOfMonth },
  }).lean();
  if (!meals.length) return 0;

  const mealIds = meals.map((m) => m._id);

  // 📋 Get attendance for meals in this month
  const attendances = await Attendance.find({
    mealId: { $in: mealIds },
  }).lean();

  let totalMeals = 0;
  let totalExpense = 0;

  for (const meal of meals) {
    const mealAttendance = attendances.find(
      (a) => String(a.mealId) === String(meal._id)
    );
    if (!mealAttendance || !mealAttendance.attendees?.length) continue;

    const totalUnits = mealAttendance.attendees.reduce(
      (sum, a) => sum + (a.mealCount || 0),
      0
    );
    const costPerUnit = totalUnits > 0 ? meal.totalCost / totalUnits : 0;

    const attendee = mealAttendance.attendees.find(
      (a) => String(a.userId) === String(userId)
    );
    if (attendee) {
      totalMeals += attendee.mealCount || 0;
      totalExpense += (attendee.mealCount || 0) * costPerUnit;
    }
  }

  // 💰 Get advances from current month
  const advances = await Advance.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startOfMonth, $lt: endOfMonth },
      },
    },
    { $group: { _id: "$userId", totalAdvance: { $sum: "$amount" } } },
  ]);

  const totalAdvance = advances.length ? advances[0].totalAdvance : 0;

  // 📊 Final balance
  const balance = Number((totalAdvance - totalExpense).toFixed(2));
  return balance;
}
