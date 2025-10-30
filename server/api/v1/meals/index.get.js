import Meal from "~/server/models/meal/index.js";
import Attendance from "~/server/models/attendance/index.js";

export default defineEventHandler(async (event) => {
  try {
    // Read query params
    const query = getQuery(event);
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    const filters = {};

    // 🗓️ Filter by date
    if (query.date) {
      filters.date = query.date; // exact match (assuming ISO date string)
    }

    // 🧾 Filter by description
    if (query.description) {
      filters.description = { $regex: query.description, $options: "i" };
    }

    // 💵 Filter by total cost
    if (query.cost) {
      filters.totalCost = Number(query.cost);
    }

    // 📝 Filter by notes
    if (query.notes) {
      filters.notes = { $regex: query.notes, $options: "i" };
    }

    // Count for pagination
    const totalMeals = await Meal.countDocuments(filters);

    // Apply filters + sort by date (descending) + pagination
    const meals = await Meal.find(filters)
      .sort({ date: -1 }) // ✅ Sort by date descending
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Fetch attendance for these meals only
    const mealIds = meals.map((m) => m._id);

    const attendance = await Attendance.find({ mealId: { $in: mealIds } })
      .populate("attendees.userId", "name email") // ✅ nested populate
      .lean();

    // Attach attendance (with mealCount) to each meal
    const mealsWithAttendance = meals.map((meal) => ({
      ...meal,
      attendees:
        attendance
          .find((a) => String(a.mealId) === String(meal._id))
          ?.attendees.map((att) => ({
            userId: att.userId?._id,
            name: att.userId?.name,
            email: att.userId?.email,
            mealCount: att.mealCount,
          })) || [],
    }));

    return {
      success: true,
      data: mealsWithAttendance,
      page,
      pages: Math.ceil(totalMeals / limit),
      total: totalMeals,
    };
  } catch (err) {
    console.error("❌ Error fetching meals:", err);
    return { success: false, error: err.message };
  }
});
