import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }
  },
  {
    // Rename timestamps to match assignment requirement. :contentReference[oaicite:5]{index=5}
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

export default mongoose.model("User", userSchema);