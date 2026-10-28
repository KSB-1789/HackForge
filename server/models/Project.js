import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        teamId: { type: Number, default: null },
        createdBy: { type: Number, default: null },
        createdAt: { type: Date, default: Date.now }
    },
    { versionKey: false, id: false }
);

export default mongoose.model("Project", projectSchema);
