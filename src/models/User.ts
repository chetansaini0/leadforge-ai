import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    avatarUrl: { type: String, default: "" },
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
  },
  { timestamps: true },
);

export type UserDoc = mongoose.InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const User = models.User || model("User", UserSchema);
