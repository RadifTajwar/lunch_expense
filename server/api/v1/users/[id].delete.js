import User from "~/server/models/user";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    return { message: "User deleted successfully", user };
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message || "Failed to delete user",
    });
  }
});
