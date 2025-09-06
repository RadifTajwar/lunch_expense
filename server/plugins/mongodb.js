import mongoose from "mongoose";

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig();

  if (!config.MONGO_URI) {
    console.error("❌ [MongoDB] No connection string found in runtimeConfig");
    return;
  }

  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(config.MONGO_URI, {
        dbName: "lunch_expense", // match your DB name
      });
      console.log("✅ [MongoDB] Connected successfully to MongoDB");
    } catch (err) {
      console.error("❌ [MongoDB] Connection failed:", err.message);
    }
  } else {
    console.log("ℹ️ [MongoDB] Already connected");
  }
});
