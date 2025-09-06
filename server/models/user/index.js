import mongoose from "mongoose";
import UserSchema from "./user.schema.js";
import { isAdmin } from "./user.methods.js";
import { findByEmail } from "./user.statics.js";

// Attach methods
UserSchema.methods.isAdmin = isAdmin;
UserSchema.statics.findByEmail = findByEmail;

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
