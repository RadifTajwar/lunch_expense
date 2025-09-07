import AdvancePayment from "~/server/models/AdvancePayment";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id;

    const deleted = await AdvancePayment.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() } },
      { new: true }
    );

    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: "AdvancePayment not found",
      });
    }

    return { success: true, data: deleted };
  } catch (err) {
    console.error("❌ Delete AdvancePayment failed:", err);
    throw createError({ statusCode: 500, statusMessage: err.message });
  }
});
