import AdvancePayment from "~/server/models/AdvancePayment";
import User from "~/server/models/user";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  try {
    // 🔐 Check token
    const authHeader = getHeader(event, "authorization");
    if (!authHeader) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw createError({ statusCode: 401, statusMessage: "Invalid token" });
    }

    // ✅ Verify actual user from DB (never trust token role)
    const authUser = await User.findOne({ email: decoded.email });
    if (!authUser) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized. User not found",
      });
    }

    if (authUser.role !== "admin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden. Only admins can add advance payments",
      });
    }

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
    const payment = await AdvancePayment.create({
      userId,
      amount,
      tips,
      date,
    });

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
