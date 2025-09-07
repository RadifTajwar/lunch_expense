import mongoose from "mongoose";
import AdvancePaymentSchema from "./advance.schema.js";

export default mongoose.models.AdvancePayment ||
  mongoose.model("AdvancePayment", AdvancePaymentSchema);
