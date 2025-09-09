// server/models/attendance/attendance.schema.js
import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mealCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    mealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
      required: true,
    },
    attendees: [attendeeSchema], // 👈 array of attendees inside one meal
  },
  { timestamps: true }
);

// ✅ TTL index (using createdAt timestamp)
attendanceSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export default attendanceSchema;
