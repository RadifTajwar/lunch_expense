import mongoose from "mongoose";

export default defineEventHandler(() => {
  return {
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date().toISOString(),
  };
});
