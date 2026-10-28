import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true },
        projectId: { type: Number, required: true },
        title: { type: String, required: true, trim: true },
        titleKey: { type: String, required: true },
        description: { type: String, default: "" },
        assigneeId: { type: Number, default: null },
        status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
        priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
        createdAt: { type: Date, default: Date.now }
    },
    { versionKey: false, id: false }
);

taskSchema.index({ projectId: 1, titleKey: 1 }, { unique: true });

export default mongoose.model("Task", taskSchema);
