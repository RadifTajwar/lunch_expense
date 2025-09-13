import User from "~/server/models/user";

export default defineEventHandler(async (event) => {
  console.log("Fetching users...");
  try {
    const query = getQuery(event); // ✅ read query params
    const filter = {};

   // 🔹 Status filter
if (query.status) {
  if (query.status === "active") {
    filter.deletedAt = null;
    filter.active = true; // ✅ only active and not deleted
  } else if (query.status === "deleted") {
    filter.deletedAt = { $ne: null };
  } else if (query.status === "inactive") {
    filter.active = false;
    filter.deletedAt = null; // ✅ still not deleted
  } else if (query.status === "current") {
    filter.deletedAt = null; // ✅ current users (not deleted)
  }
}



    // 🔹 Name or email search
    if (query.name) {
      filter.name = { $regex: query.name, $options: "i" }; // case-insensitive
    }
    if (query.email) {
      filter.email = { $regex: query.email, $options: "i" };
    }

    // 🔹 Role filter
    if (query.role=='admin' || query.role=='user') {
      filter.role = query.role;
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return { users };
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message || "Failed to fetch users",
    });
  }
});
