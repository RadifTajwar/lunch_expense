import mongoose from "mongoose";

const { Schema } = mongoose;

const AdvancePaymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    tips: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
// ✅ TTL index (using createdAt timestamp)
AdvancePaymentSchema.index({ date: 1 }, { expireAfterSeconds: 31536000 });

export default AdvancePaymentSchema;
