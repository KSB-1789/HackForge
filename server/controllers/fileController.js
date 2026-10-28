import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import multer from "multer";
import mongoose from "mongoose";
import { getFilesBucket } from "../db/gridfs.js";
import Project from "../models/Project.js";
import { parseId } from "../middleware/validation.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter(req, file, callback) {
        if (!allowedTypes.has(file.mimetype)) {
            const error = new Error("Invalid file type");
            error.status = 400;
            return callback(error);
        }
        callback(null, true);
    }
});

function validationError(res, errors) {
    return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
    });
}

function serializeFile(file) {
    const originalName = file.metadata?.originalName || file.filename;
    return {
        id: String(file._id),
        filename: originalName,
        originalName,
        mimetype: file.contentType,
        size: file.length,
        uploadedBy: file.metadata?.uploadedBy,
        url: `/api/files/${file._id}`
    };
}

export async function listFiles(req, res) {
    const projectId = parseId(req.query.projectId);
    if (projectId === null) {
        return validationError(res, { projectId: "projectId must be a positive integer" });
    }

    if (!await Project.exists({ id: projectId })) {
        return res.status(404).json({
            success: false,
            message: "Project not found"
        });
    }

    const files = await getFilesBucket()
        .find({ "metadata.projectId": projectId })
        .sort({ uploadDate: -1 })
        .toArray();

    return res.status(200).json({
        success: true,
        data: files.map(serializeFile)
    });
}

export async function uploadFile(req, res) {
    if (!req.file) {
        return validationError(res, { file: "A file is required" });
    }

    const projectId = parseId(req.body?.projectId);
    if (projectId === null) {
        return validationError(res, { projectId: "projectId must be a positive integer" });
    }

    if (!await Project.exists({ id: projectId })) {
        return res.status(404).json({
            success: false,
            message: "Project not found"
        });
    }

    const bucket = getFilesBucket();
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: {
            projectId,
            uploadedBy: req.user.id,
            originalName: req.file.originalname
        }
    });

    await pipeline(Readable.from([req.file.buffer]), uploadStream);

    const file = await bucket.find({ _id: uploadStream.id }).next();
    if (!file) {
        throw new Error("Uploaded file metadata could not be loaded from MongoDB.");
    }

    return res.status(201).json({
        success: true,
        data: serializeFile(file)
    });
}

export async function downloadFile(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({
            success: false,
            message: "File not found"
        });
    }

    const bucket = getFilesBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const file = await bucket.find({ _id: fileId }).next();

    if (!file) {
        return res.status(404).json({
            success: false,
            message: "File not found"
        });
    }

    res.attachment(file.metadata?.originalName || file.filename);
    res.setHeader("Content-Type", file.contentType || "application/octet-stream");
    res.setHeader("Content-Length", file.length);
    await pipeline(bucket.openDownloadStream(fileId), res);
}

export async function deleteFile(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({
            success: false,
            message: "File not found"
        });
    }

    const bucket = getFilesBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const file = await bucket.find({ _id: fileId }).next();

    if (!file) {
        return res.status(404).json({
            success: false,
            message: "File not found"
        });
    }
    if (file.metadata?.uploadedBy !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "You can only delete files you uploaded."
        });
    }

    await bucket.delete(fileId);
    return res.status(200).json({
        success: true,
        data: { id: String(fileId) }
    });
}
