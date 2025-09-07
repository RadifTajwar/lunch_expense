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

AdvancePaymentSchema.index({ userId: 1, date: 1 });

export default AdvancePaymentSchema;
