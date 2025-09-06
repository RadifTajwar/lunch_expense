import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, index: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default UserSchema;
