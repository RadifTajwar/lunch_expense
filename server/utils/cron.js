import cron from "node-cron";
import mongoose from "mongoose";
import User from "~/server/models/user/index";
import Advance from "~/server/models/AdvancePayment/index";
import Meal from "~/server/models/meal/index";
import Attendance from "~/server/models/attendance/index";
import ArchivedReport from "~/server/models/archivedReport/index"; // ✅ you create this schema

// Helper: generate start + end date for last month
function getLastMonthRange() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth(), 1);
  return { startDate, endDate };
}

// This is the month-end task
async function finalizeMonth() {
  try {
    console.log("🔄 Running month-end finalize job...");

    const { startDate, endDate } = getLastMonthRange();
    const monthString = `${startDate.getFullYear()}-${String(
      startDate.getMonth() + 1
    ).padStart(2, "0")}`;

    // 1. Fetch all users
    const users = await User.find().lean();

    // 2. Fetch advances for last month
    const advances = await Advance.aggregate([
      { $match: { date: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: "$userId", totalAdvance: { $sum: "$amount" } } },
    ]);

    // 3. Fetch meals & attendance
    const meals = await Meal.find({
      date: { $gte: startDate, $lt: endDate },
    }).lean();
    const attendances = await Attendance.find({
      mealId: { $in: meals.map((m) => m._id) },
    }).lean();

    const expensesByUser = {};
    for (const meal of meals) {
      const mealAttendance = attendances.find(
        (a) => String(a.mealId) === String(meal._id)
      );
      if (!mealAttendance) continue;

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

    // 4. Merge everything & archive
    for (const user of users) {
      const uid = String(user._id);
      const adv = advances.find((a) => String(a._id) === uid);
      const exp = expensesByUser[uid] || { totalMeals: 0, totalExpense: 0 };

      const totalAdvance = adv?.totalAdvance || 0;
      const totalMeals = exp.totalMeals;
      const totalExpense = Number(exp.totalExpense.toFixed(2));
      const balance = Number((totalAdvance - totalExpense).toFixed(2));

      // ✅ Save in ArchivedReports
      await ArchivedReport.create({
        userId: uid,
        name: user.name,
        email: user.email,
        role: user.role,
        month: monthString,
        totalAdvance,
        totalMeals,
        totalExpense,
        balance,
      });

      // ✅ Carry forward

      await Advance.create({
        userId: uid,
        amount: balance,
        date: endDate, // first day of next month
        type: "carry_forward",
      });
    }

    console.log(`✅ Finalized reports for ${monthString}`);
  } catch (err) {
    console.error("❌ Error in finalizeMonth cron:", err);
  }
}

// 5. Schedule the job: run at midnight on the 1st of every month
cron.schedule("0 0 1 * *", () => {
  finalizeMonth();
});
