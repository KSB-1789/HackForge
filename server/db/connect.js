import mongoose from "mongoose";
import Counter from "../models/Counter.js";
import Message from "../models/Message.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Team from "../models/Team.js";
import User from "../models/User.js";

export async function connectDatabase(uri = process.env.MONGODB_URI) {
    if (typeof uri !== "string" || uri.trim() === "") {
        throw new Error("MongoDB is not configured. Set MONGODB_URI in the server environment.");
    }

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    await Promise.all([
        Counter.init(),
        Message.init(),
        Project.init(),
        Task.init(),
        Team.init(),
        User.init()
    ]);
    await Promise.all(
        ["project-task", "message", "team", "user"].map((sequence) =>
            Counter.updateOne(
                { _id: sequence },
                { $setOnInsert: { sequence: 0 } },
                { upsert: true }
            )
        )
    );
}

export async function disconnectDatabase() {
    await mongoose.disconnect();
}
