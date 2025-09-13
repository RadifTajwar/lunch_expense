// server/api/v1/users/[id].delete.js
import User from "~/server/models/user";
import Advance from "~/server/models/AdvancePayment";
import { requireAdmin } from "~/server/utils/auth";
import { calculateUserBalance } from "~/server/utils/balance";

export default defineEventHandler(async (event) => {
  try {
    // ✅ Ensure admin
    const authUser = await requireAdmin(event);

    // ✅ Get user ID from route
    const id = getRouterParam(event, "id");

    // 🚫 Prevent deleting self
    if (authUser._id.toString() === id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Admins cannot delete themselves",
      });
    }

    // 📊 Calculate balance
    const balance = await calculateUserBalance(id);

    if (balance < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `User cannot be deleted. Negative balance: ${balance}`,
      });
    }

    if (balance > 0) {
      // 🟢 Post advance payment to settle balance before deletion
      await Advance.create({
        userId: id,
        amount: -balance, // negate so final balance = 0
        date: new Date(),
        note: "Auto-adjust on user soft deletion",
      });
    }

    // 🟡 Soft delete user
    const user = await User.findByIdAndUpdate(
      id,
      {
        active: false,         // mark inactive
        deleted: true,         // mark deleted
        deletedAt: new Date(), // timestamp
        deletedBy: authUser._id,
      },
      { new: true }
    );

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    return {
      success: true,
      message: "User soft-deleted successfully",
      user,
    };
  } catch (err) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Failed to delete user",
    });
  }
});
