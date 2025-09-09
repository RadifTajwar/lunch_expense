import mongoose from "mongoose";

const ArchivedReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  email: String,
  role: String,
  month: String, // "YYYY-MM"
  totalAdvance: Number,
  totalMeals: Number,
  totalExpense: Number,
  balance: Number,
});

export default mongoose.models.ArchivedReport ||
  mongoose.model("ArchivedReport", ArchivedReportSchema);
