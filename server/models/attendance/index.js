import mongoose from "mongoose";
import attendanceSchema from "./attendance.schema.js";
import attendanceMethods from "./attendance.methods.js";
import attendanceStatics from "./attendance.statics.js";

// Attach methods
attendanceSchema.methods = {
  ...attendanceSchema.methods,
  ...attendanceMethods,
};

// Attach statics
attendanceSchema.statics = {
  ...attendanceSchema.statics,
  ...attendanceStatics,
};

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);
