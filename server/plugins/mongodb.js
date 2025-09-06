import mongoose from "mongoose";

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig();

  if (!config.MONGO_URI) {
    console.error("❌ [MongoDB] No connection string found in runtimeConfig");
    return;
  }

  // Prevent multiple connections in dev
  if (mongoose.connection && mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(config.MONGO_URI, {
        dbName: "lunch_expense", // <-- your DB name
      });
      console.log("✅ [MongoDB] Connected successfully to MongoDB");
    } catch (err) {
      console.error("❌ [MongoDB] Connection failed:", err.message);
    }
  }
});
