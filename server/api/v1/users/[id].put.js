import User from "~/server/models/user";
import { requireAdmin } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    // ✅ Get logged-in admin
    const authUser = await requireAdmin(event);

    // ✅ Target user ID
    const id = getRouterParam(event, "id");
    const body = await readBody(event);
    const { name, email, role, active, deletedAt } = body;

    // 🚫 Prevent admin from changing their own role
    if (authUser._id.toString() === id && role && role !== authUser.role) {
      throw createError({
        statusCode: 400,
        statusMessage: "Admins cannot change their own role",
      });
    }

    // ✅ Build update object dynamically (only include fields that exist in body)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (active !== undefined) updateData.active = active;

    // 🔹 Handle delete / restore
    if (deletedAt !== undefined) {
      updateData.deletedAt = deletedAt; // send null for restore, timestamp for delete
    }

    // ✅ Perform the update
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

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
