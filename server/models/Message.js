import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true },
        projectId: { type: Number, required: true },
        senderId: { type: Number, required: true },
        message: { type: String, required: true, trim: true, maxlength: 2000 },
        createdAt: { type: Date, default: Date.now }
    },
    { versionKey: false, id: false }
);

messageSchema.index({ projectId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
