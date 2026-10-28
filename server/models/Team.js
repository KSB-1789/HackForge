import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true },
        name: { type: String, required: true, trim: true },
        nameKey: { type: String, required: true, unique: true },
        description: { type: String, default: "" },
        ownerId: { type: Number, required: true },
        members: { type: [Number], default: [] },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    { versionKey: false, id: false }
);

export default mongoose.model("Team", teamSchema);
