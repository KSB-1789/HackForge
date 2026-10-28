import { nextId } from "../db/counters.js";
import { deleteProjectCollaborationData } from "../db/gridfs.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { toApiRecord } from "../utils/serializers.js";

function normalizeTeamId(value) {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    return Number(value);
}

function getId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

async function getProjects(req, res) {
    const projects = await Project.find().sort({ id: 1 }).lean();
    res.status(200).json({ success: true, data: projects.map(toApiRecord) });
}

async function createProject(req, res) {
    const { name, description, teamId } = req.body;
    const project = await Project.create({
        id: await nextId("project-task"),
        name: name.trim(),
        description: typeof description === "string" ? description : "",
        teamId: normalizeTeamId(teamId),
        createdBy: req.user ? req.user.id : null
    });

    res.status(201).json({ success: true, data: toApiRecord(project) });
}

async function getProjectById(req, res) {
    const id = getId(req.params.id);
    if (id === null) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    const project = await Project.findOne({ id }).lean();

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found"
        });
    }

    res.status(200).json({ success: true, data: toApiRecord(project) });
}

async function updateProject(req, res) {
    const id = getId(req.params.id);
    if (id === null) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    const updates = {};
    const { name, description, teamId } = req.body;

    if (name !== undefined) {
        updates.name = name.trim();
    }
    if (description !== undefined) {
        updates.description = String(description);
    }
    if (teamId !== undefined) {
        updates.teamId = normalizeTeamId(teamId);
    }

    const project = await Project.findOneAndUpdate(
        { id },
        { $set: updates },
        { returnDocument: "after", runValidators: true }
    ).lean();

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found"
        });
    }

    res.status(200).json({ success: true, data: toApiRecord(project) });
}

async function deleteProject(req, res) {
    const id = getId(req.params.id);
    if (id === null) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    const project = await Project.findOne({ id }).lean();

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found"
        });
    }

    const [{ deletedCount }, collaboration] = await Promise.all([
        Task.deleteMany({ projectId: id }),
        deleteProjectCollaborationData(id)
    ]);
    await Project.deleteOne({ id });

    res.status(200).json({
        success: true,
        data: {
            id,
            deletedTasks: deletedCount,
            ...collaboration
        }
    });
}

export { getProjects, createProject, getProjectById, updateProject, deleteProject };
