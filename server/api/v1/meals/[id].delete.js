import Meal from "~/server/models/meal/index.js";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    const meal = await Meal.findByIdAndDelete(
      id,
      { deletedAt: new Date() },
      { new: true }
    );

    if (!meal) {
      throw createError({
        statusCode: 404,
        statusMessage: "Meal not found",
      });
    }

    return {
      success: true,
      message: "Meal deleted",
    };
  } catch (err) {
    console.error("❌ Error deleting meal:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Server error",
    });
  }
});
