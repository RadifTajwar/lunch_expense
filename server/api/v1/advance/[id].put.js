// server/api/v1/advance-payment/[id].put.js
import AdvancePayment from "~/server/models/AdvancePayment";
import { requireAdmin } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    // ✅ Only admins can update advance payments
    await requireAdmin(event);

    const id = event.context.params.id;
    const body = await readBody(event);

    const updated = await AdvancePayment.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true } // 👈 run validators for safe updates
    );

    if (!updated) {
      throw createError({
        statusCode: 404,
        statusMessage: "AdvancePayment not found",
      });
    }

    return {
      success: true,
      message: "AdvancePayment updated successfully",
      data: updated,
    };
  } catch (err) {
    console.error("❌ Update AdvancePayment failed:", err);
    throw createError({ statusCode: 500, statusMessage: err.message });
  }
});
