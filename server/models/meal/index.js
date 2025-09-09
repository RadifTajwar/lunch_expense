import mongoose from "mongoose";
import mealSchema from "./meal.schema.js";
import mealMethods from "./meal.methods.js";
import mealStatics from "./meal.statics.js";

// Attach methods
mealSchema.methods = {
  ...mealSchema.methods,
  ...mealMethods,
};

// Attach statics
mealSchema.statics = {
  ...mealSchema.statics,
  ...mealStatics,
};

export default mongoose.models.Meal || mongoose.model("Meal", mealSchema);
