// server/api/v1/users/[id].put.js
import User from "~/server/models/user";
import { requireAdmin } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    // ✅ Get logged-in admin
    const authUser = await requireAdmin(event);

    // ✅ Target user ID
    const id = getRouterParam(event, "id");
    const body = await readBody(event);
    const { name, email, role } = body;

    // 🚫 Prevent admin from changing their own role
    if (authUser._id.toString() === id && role && role !== authUser.role) {
      throw createError({
        statusCode: 400,
        statusMessage: "Admins cannot change their own role",
      });
    }

    // ✅ Perform the update
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
