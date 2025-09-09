// server/api/v1/users/index.post.js
import User from "~/server/models/user/index.js";
import { requireAdmin } from "~/server/utils/auth.js"; // ✅ Import reusable check

export default defineEventHandler(async (event) => {
  // 🔒 Require admin
  await requireAdmin(event);

  const body = await readBody(event);
  const { name, email, role } = body;

  if (!name || !email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name and email are required",
    });
  }

  // 🔍 Check if new user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: "User already exists",
    });
  }

  // ✅ Create user
  const newUser = await User.create({
    name,
    email,
    role: role || "member", // default role
  });

  return {
    success: true,
    user: newUser,
  };
});
