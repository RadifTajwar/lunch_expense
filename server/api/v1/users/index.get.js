import User from "~/server/models/user";

export default defineEventHandler(async () => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return { users };
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message || "Failed to fetch users",
    });
  }
});
