import { defineEventHandler, getQuery } from "h3";
import mongoose from "mongoose";
import User from "~/server/models/user/index";
import Meal from "~/server/models/meal/index";
import Advance from "~/server/models/AdvancePayment/index";
import Attendance from "~/server/models/attendance/index"; // ✅ attendance model

export default defineEventHandler(async (event) => {
  try {
    const { month, userId } = getQuery(event);

    if (!month) {
      return {
        success: false,
        message: 'Query param "month" (YYYY-MM) is required',
      };
    }

    const [year, mon] = month.split("-").map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 1);

    const userFilter = userId
      ? { userId: new mongoose.Types.ObjectId(userId) }
      : {};

    // --- 1. Fetch all users first
    const allUsers = await User.find({}).select("name email role").lean();

    // --- 2. Advances
    const advances = await Advance.aggregate([
      { $match: { date: { $gte: startDate, $lt: endDate }, ...userFilter } },
      { $group: { _id: "$userId", totalAdvance: { $sum: "$amount" } } },
    ]);

    // --- 3. Meals
    const meals = await Meal.find({
      date: { $gte: startDate, $lt: endDate },
    }).lean();

    const mealIds = meals.map((m) => m._id);

    // --- 4. Attendance for these meals
    const attendances = await Attendance.find({
      mealId: { $in: mealIds },
    }).lean();

    const expensesByUser = {};

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

      for (const attendee of mealAttendance.attendees) {
        const uid = String(attendee.userId);
        const expense = (attendee.mealCount || 0) * costPerUnit;

        if (!expensesByUser[uid]) {
          expensesByUser[uid] = { totalMeals: 0, totalExpense: 0 };
        }

        expensesByUser[uid].totalMeals += attendee.mealCount || 0;
        expensesByUser[uid].totalExpense += expense;
      }
    }

    // --- 5. Merge all users, advances + expenses
    const results = allUsers.map((user) => {
      const uid = String(user._id);
      const adv = advances.find((a) => String(a._id) === uid);
      const exp = expensesByUser[uid] || { totalMeals: 0, totalExpense: 0 };

      return {
        userId: uid,
        name: user.name,
        email: user.email,
        role: user.role,
        totalAdvance: adv?.totalAdvance || 0,
        totalMeals: exp.totalMeals,
        totalExpense: Number(exp.totalExpense.toFixed(2)),
        balance: Number(
          ((adv?.totalAdvance || 0) - exp.totalExpense).toFixed(2)
        ),
      };
    });

    return { success: true, data: results };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Failed to generate report" };
  }
});
