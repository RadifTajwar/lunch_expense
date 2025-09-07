import User from "~/server/models/user";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const body = await readBody(event);

    const { name, email, role } = body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    return { message: "User updated successfully", user };
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message || "Failed to update user",
    });
  }
});
