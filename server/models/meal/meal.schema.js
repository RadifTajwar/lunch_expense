import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    totalCost: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "", // Optional: empty string by default
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// ✅ TTL index: automatically delete meals 1 year after `date`
mealSchema.index({ date: 1 }, { expireAfterSeconds: 31536000 });

export default mealSchema;
