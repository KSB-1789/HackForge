import mongoose from "mongoose";
import Message from "../models/Message.js";

export function getFilesBucket() {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
        throw new Error("MongoDB must be connected before accessing uploaded files.");
    }

    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "projectFiles"
    });
}

export async function deleteProjectFiles(projectId) {
    const bucket = getFilesBucket();
    const files = await bucket.find({ "metadata.projectId": projectId }).toArray();
    await Promise.all(files.map((file) => bucket.delete(file._id)));
    return files.length;
}

export async function deleteProjectCollaborationData(projectId) {
    const [messageResult, deletedFiles] = await Promise.all([
        Message.deleteMany({ projectId }),
        deleteProjectFiles(projectId)
    ]);

    return {
        deletedMessages: messageResult.deletedCount,
        deletedFiles
    };
}
