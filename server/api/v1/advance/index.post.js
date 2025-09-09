// server/api/advance/index.post.js
import AdvancePayment from "~/server/models/AdvancePayment";
import User from "~/server/models/user";
import { requireAdmin } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    // 🔐 Only admins can create advance payments
    const authUser = await requireAdmin(event);

    // 📥 Read body
    const body = await readBody(event);
    const { userId, amount, tips = 0, date } = body;

    // 🛑 Validate required fields
    if (!userId || !amount || !date) {
      throw createError({
        statusCode: 400,
        statusMessage: "userId, amount and date are required",
      });
    }

    // 🔍 Check if target user exists
    const user = await User.findById(userId);
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found. Cannot assign advance payment.",
      });
    }

    // 💾 Create advance payment
    let payment = await AdvancePayment.create({
      userId,
      amount,
      tips,
      date,
    });

    // 🔄 Populate user info before sending response
    payment = await payment.populate("userId", "name email role");

    return {
      success: true,
      message: "Advance payment created successfully",
      data: payment,
    };
  } catch (err) {
    console.error("❌ [AdvancePayment POST] Error:", err.message);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Failed to create advance payment",
    });
  }
});
