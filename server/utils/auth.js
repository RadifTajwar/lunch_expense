// server/utils/auth.js
import jwt from "jsonwebtoken";
import User from "~/server/models/user/index.js";

export async function requireAdmin(event) {
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

  // ✅ Verify user in DB
  const authUser = await User.findOne({ email: decoded.email });
  if (!authUser) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized. User not found.",
    });
  }

  // ✅ Check role
  if (authUser.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden. Only admins allowed.",
    });
  }

  return authUser; // return the authenticated admin user
}
