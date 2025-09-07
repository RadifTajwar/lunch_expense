import AdvancePayment from "~/server/models/AdvancePayment";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id;
    const body = await readBody(event);

    const updated = await AdvancePayment.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!updated) {
      throw createError({
        statusCode: 404,
        statusMessage: "AdvancePayment not found",
      });
    }

    return { success: true, data: updated };
  } catch (err) {
    console.error("❌ Update AdvancePayment failed:", err);
    throw createError({ statusCode: 500, statusMessage: err.message });
  }
});
