import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        projectId: {type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true},
        title: {type: String, trim: true, required: true},
        description: {type: String, default: ''},
        assigneeId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        status: {type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo'},
        priority: {type: String, enum: ['high','medium','low'], default: 'low'}
    },
    {timestamps: true}
)

const Task = mongoose.model('Task',taskSchema)

export default Task