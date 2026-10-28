import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    },
    { versionKey: false, id: false }
);

export default mongoose.model("User", userSchema);
