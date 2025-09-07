import User from "~/server/models/user";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, email, role } = body;

  if (!name || !email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name and email are required",
    });
  }

  // ✅ Check auth token
  const authHeader = getHeader(event, "authorization");
  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw createError({ statusCode: 401, statusMessage: "Invalid token" });
  }

  // ✅ Verify user from DB (never trust JWT role blindly)
  const authUser = await User.findOne({ email: decoded.email });
  if (!authUser) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized. User not found.",
    });
  }

  if (authUser.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden. Only admins can create users.",
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
