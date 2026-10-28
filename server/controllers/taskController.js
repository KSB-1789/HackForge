import { nextId } from "../db/counters.js";
import Task from "../models/Task.js";
import { toApiRecord } from "../utils/serializers.js";

function getId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

async function getTasks(req, res) {
    const filter = {};

    if (req.query.projectId !== undefined) {
        const id = Number(req.query.projectId);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: { projectId: "projectId must be a number" }
            });
        }

        filter.projectId = id;
    }

    const tasks = await Task.find(filter).sort({ id: 1 }).lean();
    res.status(200).json({ success: true, data: tasks.map(toApiRecord) });
}

async function createTask(req, res) {
    const { projectId, title, description, assigneeId, status, priority } = req.body;
    const cleanTitle = title.trim();
    const task = await Task.create({
        id: await nextId("project-task"),
        projectId: Number(projectId),
        title: cleanTitle,
        titleKey: cleanTitle.toLowerCase(),
        description: typeof description === "string" ? description : "",
        assigneeId: assigneeId === undefined || assigneeId === null || assigneeId === ""
            ? null
            : Number(assigneeId),
        status: status === undefined ? "todo" : status,
        priority: priority === undefined ? "medium" : priority
    });

    res.status(201).json({ success: true, data: toApiRecord(task) });
}

async function getTaskById(req, res) {
    const id = getId(req.params.id);
    if (id === null) {
        return res.status(404).json({ success: false, message: "Task not found" });
    }

    const task = await Task.findOne({ id }).lean();

    if (!task) {
        return res.status(404).json({
            success: false,
            message: "Task not found"
        });
    }

    res.status(200).json({ success: true, data: toApiRecord(task) });
}

async function updateTask(req, res) {
    const id = getId(req.params.id);
    if (id === null) {
        return res.status(404).json({ success: false, message: "Task not found" });
    }

    const updates = {};
    const { projectId, title, description, assigneeId, status, priority } = req.body;

    if (projectId !== undefined) {
        updates.projectId = Number(projectId);
    }
    if (title !== undefined) {
        updates.title = title.trim();
        updates.titleKey = title.trim().toLowerCase();
    }
    if (description !== undefined) {
        updates.description = String(description);
    }
    if (assigneeId !== undefined) {
        updates.assigneeId = assigneeId === null || assigneeId === ""
            ? null
            : Number(assigneeId);
    }
    if (status !== undefined) {
        updates.status = status;
    }
    if (priority !== undefined) {
        updates.priority = priority;
    }

    const task = await Task.findOneAndUpdate(
        { id },
        { $set: updates },
        { returnDocument: "after", runValidators: true }
    ).lean();

    if (!task) {
        return res.status(404).json({
            success: false,
            message: "Task not found"
        });
    }

    res.status(200).json({ success: true, data: toApiRecord(task) });
}

async function deleteTask(req, res) {
    const id = getId(req.params.id);
    if (id === null) {
        return res.status(404).json({ success: false, message: "Task not found" });
    }

    const task = await Task.findOneAndDelete({ id }).lean();

    if (!task) {
        return res.status(404).json({
            success: false,
            message: "Task not found"
        });
    }

    res.status(200).json({ success: true, data: { id } });
}

export { getTasks, createTask, getTaskById, updateTask, deleteTask };
