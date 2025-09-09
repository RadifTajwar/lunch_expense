import Meal from "~/server/models/meal/index.js";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const meal = await Meal.findById(id).populate(
      "attendees.userId",
      "name email"
    );

    if (!meal) {
      throw createError({
        statusCode: 404,
        statusMessage: "Meal not found",
      });
    }

    return {
      success: true,
      data: meal,
    };
  } catch (err) {
    console.error("❌ Error fetching meal:", err);
    throw createError({
      statusCode: 500,
      statusMessage: err.message,
    });
  }
});
