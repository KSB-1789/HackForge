import { nextId } from "../db/counters.js";
import Message from "../models/Message.js";
import Project from "../models/Project.js";
import { parseId } from "../middleware/validation.js";
import { toApiRecord } from "../utils/serializers.js";

function validationError(res, errors) {
    return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
    });
}

export async function getMessages(req, res) {
    const filter = {};

    if (req.query.projectId !== undefined) {
        const projectId = parseId(req.query.projectId);
        if (projectId === null) {
            return validationError(res, { projectId: "projectId must be a positive integer" });
        }
        filter.projectId = projectId;
    }

    const messages = await Message.find(filter)
        .sort({ createdAt: 1, id: 1 })
        .lean();

    return res.status(200).json({
        success: true,
        data: messages.map(toApiRecord)
    });
}

export async function createMessage(req, res) {
    const projectId = parseId(req.body?.projectId);
    const message = req.body?.message;
    const errors = {};

    if (projectId === null) {
        errors.projectId = "projectId must be a positive integer";
    }
    if (typeof message !== "string" || message.trim().length === 0) {
        errors.message = "Message cannot be empty";
    } else if (message.trim().length > 2000) {
        errors.message = "Message must be 2000 characters or fewer";
    }
    if (Object.keys(errors).length > 0) {
        return validationError(res, errors);
    }

    if (!await Project.exists({ id: projectId })) {
        return res.status(404).json({
            success: false,
            message: "Project not found"
        });
    }

    const created = await Message.create({
        id: await nextId("message"),
        projectId,
        senderId: req.user.id,
        message: message.trim()
    });

    return res.status(201).json({
        success: true,
        data: toApiRecord(created)
    });
}

export async function deleteMessage(req, res) {
    const id = parseId(req.params.id);
    if (id === null) {
        return res.status(404).json({
            success: false,
            message: "Message not found"
        });
    }

    const message = await Message.findOne({ id });
    if (!message) {
        return res.status(404).json({
            success: false,
            message: "Message not found"
        });
    }
    if (message.senderId !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "You can only delete your own messages"
        });
    }

    await message.deleteOne();
    return res.status(200).json({
        success: true,
        data: { id }
    });
}
