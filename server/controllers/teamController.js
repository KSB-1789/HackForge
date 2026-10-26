import { teams, users, nextTeamId } from "../data/userteamstore.js";
import { isNonEmptyString, parseId, parseMemberIds } from "../middleware/validation.js";
import { toPublicTeam } from "../utils/serializers.js";

function hasDuplicateName(name, excludeTeamId = null) {
    const normalized = name.trim().toLowerCase();

    return teams.some(
        (team) =>
            team.id !== excludeTeamId &&
            team.name.trim().toLowerCase() === normalized
    );
}

function validateMembers(rawMembers, ownerId) {
    const parsed = parseMemberIds(rawMembers);

    if (parsed.error) {
        return parsed;
    }

    for (const memberId of parsed.ids) {
        if (memberId === ownerId) {
            return { error: "The owner is already part of the team." };
        }

        const memberExists = users.some((user) => user.id === memberId);

        if (!memberExists) {
            return { error: `User ${memberId} does not exist.` };
        }
    }

    return { ids: parsed.ids };
}

export function listTeams(req, res) {
    return res.status(200).json({
        success: true,
        data: {
            teams: teams.map(toPublicTeam)
        }
    });
}

export function createTeam(req, res) {
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

    if (hasDuplicateName(cleanName)) {
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
        const parsedMembers = validateMembers(members, req.user.id);

        if (parsedMembers.error) {
            return res.status(400).json({
                success: false,
                message: parsedMembers.error
            });
        }

        memberIds = parsedMembers.ids;
    }

    const now = new Date().toISOString();
    const team = {
        id: nextTeamId(),
        name: cleanName,
        description: cleanDescription,
        ownerId: req.user.id,
        members: memberIds,
        createdAt: now,
        updatedAt: now
    };

    teams.push(team);

    return res.status(201).json({
        success: true,
        message: "Team created.",
        data: {
            team: toPublicTeam(team)
        }
    });
}

export function getTeamById(req, res) {
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            success: false,
            message: "Team id must be a positive integer."
        });
    }

    const team = teams.find((entry) => entry.id === id);

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

export function updateTeam(req, res) {
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            success: false,
            message: "Team id must be a positive integer."
        });
    }

    const team = teams.find((entry) => entry.id === id);

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

    let nextName = team.name;

    if (name !== undefined) {
        if (!isNonEmptyString(name)) {
            return res.status(400).json({
                success: false,
                message: "Team name cannot be empty."
            });
        }

        nextName = name.trim();

        if (nextName.length > 80) {
            return res.status(400).json({
                success: false,
                message: "Team name must be 80 characters or fewer."
            });
        }

        if (hasDuplicateName(nextName, team.id)) {
            return res.status(409).json({
                success: false,
                message: "A team with this name already exists."
            });
        }
    }

    let nextDescription = team.description;

    if (description !== undefined) {
        if (typeof description !== "string") {
            return res.status(400).json({
                success: false,
                message: "Description must be a string."
            });
        }

        nextDescription = description.trim();

        if (nextDescription.length > 500) {
            return res.status(400).json({
                success: false,
                message: "Description must be 500 characters or fewer."
            });
        }
    }

    let nextMembers = team.members;

    if (members !== undefined) {
        const parsedMembers = validateMembers(members, team.ownerId);

        if (parsedMembers.error) {
            return res.status(400).json({
                success: false,
                message: parsedMembers.error
            });
        }

        nextMembers = parsedMembers.ids;
    }

    team.name = nextName;
    team.description = nextDescription;
    team.members = nextMembers;
    team.updatedAt = new Date().toISOString();

    return res.status(200).json({
        success: true,
        message: "Team updated.",
        data: {
            team: toPublicTeam(team)
        }
    });
}

export function deleteTeam(req, res) {
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            success: false,
            message: "Team id must be a positive integer."
        });
    }

    const teamIndex = teams.findIndex((entry) => entry.id === id);

    if (teamIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Team not found."
        });
    }

    const team = teams[teamIndex];

    if (team.ownerId !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "Only the team owner can delete this team."
        });
    }

    teams.splice(teamIndex, 1);

    return res.status(200).json({
        success: true,
        message: "Team deleted.",
        data: {
            team: toPublicTeam(team)
        }
    });
}
