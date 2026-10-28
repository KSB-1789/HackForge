import { nextId } from "../db/counters.js";
import Project from "../models/Project.js";
import Team from "../models/Team.js";
import User from "../models/User.js";
import { isNonEmptyString, parseId, parseMemberIds } from "../middleware/validation.js";
import { toPublicTeam } from "../utils/serializers.js";

async function hasDuplicateName(name, excludeTeamId = null) {
    const filter = { nameKey: name.trim().toLowerCase() };

    if (excludeTeamId !== null) {
        filter.id = { $ne: excludeTeamId };
    }

    return Boolean(await Team.exists(filter));
}

async function validateMembers(rawMembers, ownerId) {
    const parsed = parseMemberIds(rawMembers);

    if (parsed.error) {
        return parsed;
    }

    for (const memberId of parsed.ids) {
        if (memberId === ownerId) {
            return { error: "The owner is already part of the team." };
        }

        if (!await User.exists({ id: memberId })) {
            return { error: `User ${memberId} does not exist.` };
        }
    }

    return { ids: parsed.ids };
}

export async function listTeams(req, res) {
    const teams = await Team.find().sort({ id: 1 }).lean();
    return res.status(200).json({
        success: true,
        data: {
            teams: teams.map(toPublicTeam)
        }
    });
}

export async function createTeam(req, res) {
    const { name, description, members } = req.body || {};

    if (!isNonEmptyString(name)) {
        return res.status(400).json({
            success: false,
            message: "Team name is required."
        });
    }

    const cleanName = name.trim();

    if (cleanName.length > 80) {
        return res.status(400).json({
            success: false,
            message: "Team name must be 80 characters or fewer."
        });
    }

    if (await hasDuplicateName(cleanName)) {
        return res.status(409).json({
            success: false,
            message: "A team with this name already exists."
        });
    }

    let cleanDescription = "";

    if (description !== undefined) {
        if (typeof description !== "string") {
            return res.status(400).json({
                success: false,
                message: "Description must be a string."
            });
        }

        cleanDescription = description.trim();

        if (cleanDescription.length > 500) {
            return res.status(400).json({
                success: false,
                message: "Description must be 500 characters or fewer."
            });
        }
    }

    let memberIds = [];

    if (members !== undefined) {
        const parsedMembers = await validateMembers(members, req.user.id);

        if (parsedMembers.error) {
            return res.status(400).json({
                success: false,
                message: parsedMembers.error
            });
        }

        memberIds = parsedMembers.ids;
    }

    const now = new Date();
    const team = await Team.create({
        id: await nextId("team"),
        name: cleanName,
        nameKey: cleanName.toLowerCase(),
        description: cleanDescription,
        ownerId: req.user.id,
        members: memberIds,
        createdAt: now,
        updatedAt: now
    });

    return res.status(201).json({
        success: true,
        message: "Team created.",
        data: {
            team: toPublicTeam(team)
        }
    });
}

export async function getTeamById(req, res) {
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            success: false,
            message: "Team id must be a positive integer."
        });
    }

    const team = await Team.findOne({ id }).lean();

    if (!team) {
        return res.status(404).json({
            success: false,
            message: "Team not found."
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            team: toPublicTeam(team)
        }
    });
}

export async function updateTeam(req, res) {
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            success: false,
            message: "Team id must be a positive integer."
        });
    }

    const team = await Team.findOne({ id });

    if (!team) {
        return res.status(404).json({
            success: false,
            message: "Team not found."
        });
    }

    if (team.ownerId !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "Only the team owner can update this team."
        });
    }

    const { name, description, members } = req.body || {};

    if (
        name === undefined &&
        description === undefined &&
        members === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Provide at least one field to update."
        });
    }

    if (name !== undefined) {
        if (!isNonEmptyString(name)) {
            return res.status(400).json({
                success: false,
                message: "Team name cannot be empty."
            });
        }

        const nextName = name.trim();

        if (nextName.length > 80) {
            return res.status(400).json({
                success: false,
                message: "Team name must be 80 characters or fewer."
            });
        }

        if (await hasDuplicateName(nextName, team.id)) {
            return res.status(409).json({
                success: false,
                message: "A team with this name already exists."
            });
        }

        team.name = nextName;
        team.nameKey = nextName.toLowerCase();
    }

    if (description !== undefined) {
        if (typeof description !== "string") {
            return res.status(400).json({
                success: false,
                message: "Description must be a string."
            });
        }

        const nextDescription = description.trim();

        if (nextDescription.length > 500) {
            return res.status(400).json({
                success: false,
                message: "Description must be 500 characters or fewer."
            });
        }

        team.description = nextDescription;
    }

    if (members !== undefined) {
        const parsedMembers = await validateMembers(members, team.ownerId);

        if (parsedMembers.error) {
            return res.status(400).json({
                success: false,
                message: parsedMembers.error
            });
        }

        team.members = parsedMembers.ids;
    }

    team.updatedAt = new Date();
    await team.save();

    return res.status(200).json({
        success: true,
        message: "Team updated.",
        data: {
            team: toPublicTeam(team)
        }
    });
}

export async function deleteTeam(req, res) {
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            success: false,
            message: "Team id must be a positive integer."
        });
    }

    const team = await Team.findOne({ id });

    if (!team) {
        return res.status(404).json({
            success: false,
            message: "Team not found."
        });
    }

    if (team.ownerId !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "Only the team owner can delete this team."
        });
    }

    const linkedProjects = await Project.countDocuments({ teamId: id });

    if (linkedProjects > 0) {
        return res.status(409).json({
            success: false,
            message: `This team still has ${linkedProjects} project(s). Delete or reassign them first.`
        });
    }

    await team.deleteOne();

    return res.status(200).json({
        success: true,
        message: "Team deleted.",
        data: {
            team: toPublicTeam(team)
        }
    });
}
