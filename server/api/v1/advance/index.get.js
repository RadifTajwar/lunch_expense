// server/api/advance/index.get.js
import AdvancePayment from "~/server/models/AdvancePayment";
import User from "~/server/models/user";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const {
      userId,
      startDate,
      endDate,
      name,
      email,
      page = 1,
      limit = 10,
    } = query;
    const filter = { deletedAt: null };

    // 🔍 If searching by userId
    if (userId) {
      filter.userId = userId;
    }

    // 🔍 If searching by user name/email
    if (name || email) {
      const userFilter = {};
      if (name) userFilter.name = { $regex: name, $options: "i" };
      if (email) userFilter.email = { $regex: email, $options: "i" };

      const users = await User.find(userFilter, "_id");
      const userIds = users.map((u) => u._id);

      if (userIds.length > 0) {
        filter.userId = { $in: userIds };
      } else {
        return { success: true, count: 0, data: [] }; // nothing matches
      }
    }

    // 🔍 If filtering by date
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // 📄 Pagination setup
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AdvancePayment.countDocuments(filter);

    const advances = await AdvancePayment.find(filter)
      .populate("userId", "name email role")
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return {
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: advances,
    };
  } catch (err) {
    console.error("❌ [AdvancePayment GET] Error:", err.message);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch advance payments",
    });
  }
});
