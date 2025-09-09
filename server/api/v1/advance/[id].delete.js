// server/api/v1/advance-payment/[id].delete.js
import AdvancePayment from "~/server/models/AdvancePayment";
import { requireAdmin } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    // ✅ Only admins can delete advance payments
    await requireAdmin(event);

    const id = event.context.params.id;

    // 🔥 Hard delete (completely removes the document)
    const deleted = await AdvancePayment.findByIdAndDelete(id);

    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: "AdvancePayment not found",
      });
    }

    return {
      success: true,
      message: "AdvancePayment deleted successfully",
      data: deleted,
    };
  } catch (err) {
    console.error("❌ Delete AdvancePayment failed:", err);
    throw createError({ statusCode: 500, statusMessage: err.message });
  }
});
