import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Team from "../models/Team.js";
import User from "../models/User.js";

// ---------------------------------------------------------------------------
// Shared helpers (P1: auth, users, teams)
// ---------------------------------------------------------------------------

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

export function normalizeEmail(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(value) {
    return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

export function parseId(value) {
    if (typeof value !== "string" && typeof value !== "number") {
        return null;
    }

    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export function parseMemberIds(value) {
    if (!Array.isArray(value)) {
        return { error: "Members must be an array of user ids." };
    }

    const ids = [];

    for (const rawId of value) {
        const id = parseId(rawId);

        if (id === null) {
            return { error: "Member ids must be positive integers." };
        }

        if (!ids.includes(id)) {
            ids.push(id);
        }
    }

    return { ids };
}

// ---------------------------------------------------------------------------
// Project and task validators (P2: projects, tasks)
// ---------------------------------------------------------------------------

const TASK_STATUSES = ['todo', 'in-progress', 'done'];
const TASK_PRIORITIES = ['low', 'medium', 'high'];

function fail(res, errors) {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors,
  });
}

async function validateProjectCreate(req, res, next) {
  const { name, teamId } = req.body || {};
  const errors = {};

  if (typeof name !== 'string' || name.trim().length < 3) {
    errors.name = 'Project name must be at least 3 characters';
  }

  await collectTeamErrors(teamId, errors);

  if (Object.keys(errors).length > 0) {
    return fail(res, errors);
  }
  next();
}

async function validateProjectUpdate(req, res, next) {
  const { name, teamId } = req.body || {};
  const errors = {};

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 3)) {
    errors.name = 'Project name must be at least 3 characters';
  }

  await collectTeamErrors(teamId, errors);

  if (Object.keys(errors).length > 0) {
    return fail(res, errors);
  }
  next();
}

async function collectTeamErrors(teamId, errors) {
  if (teamId === undefined || teamId === null || teamId === '') {
    return;
  }

  const numeric = Number(teamId);

  if (!Number.isInteger(numeric) || numeric <= 0) {
    errors.teamId = 'teamId must be a positive integer';
  } else if (!await Team.exists({ id: numeric })) {
    errors.teamId = 'Team does not exist';
  }
}

async function userExists(userId) {
  const id = parseId(userId);
  return id !== null && Boolean(await User.exists({ id }));
}

async function projectExists(projectId) {
  const id = parseId(projectId);
  return id !== null && Boolean(await Project.exists({ id }));
}

async function collectTaskErrors(rawBody, isCreate, taskId) {
  const body = rawBody || {};
  const errors = {};
  const { title, projectId, status, priority, assigneeId } = body;

  const titleProvided = title !== undefined;
  if (isCreate || titleProvided) {
    if (typeof title !== 'string' || title.trim().length < 3) {
      errors.title = 'Task title must be at least 3 characters';
    }
  }

  const projectIdProvided = projectId !== undefined && projectId !== null;
  if (isCreate || projectIdProvided) {
    if (!projectIdProvided) {
      errors.projectId = 'projectId is required';
    } else if (!await projectExists(projectId)) {
      errors.projectId = 'Project does not exist';
    }
  }

  const existingTask = taskId === undefined
    ? undefined
    : await Task.findOne({ id: taskId }).lean();
  const comparisonTitle = title === undefined ? existingTask?.title : title;
  const targetProjectId = projectIdProvided
    ? Number(projectId)
    : existingTask?.projectId;
  if (
    (isCreate || existingTask) &&
    typeof comparisonTitle === 'string' &&
    comparisonTitle.trim().length >= 3 &&
    targetProjectId !== undefined
  ) {
    const duplicateFilter = {
      projectId: targetProjectId,
      titleKey: comparisonTitle.trim().toLowerCase()
    };

    if (taskId !== undefined) {
      duplicateFilter.id = { $ne: taskId };
    }

    if (await Task.exists(duplicateFilter)) {
      errors.title = 'A task with this name already exists in this project';
    }
  }

  if (status !== undefined && !TASK_STATUSES.includes(status)) {
    errors.status = `Status must be one of: ${TASK_STATUSES.join(', ')}`;
  }

  if (priority !== undefined && !TASK_PRIORITIES.includes(priority)) {
    errors.priority = `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`;
  }

  if (assigneeId !== undefined && assigneeId !== null && assigneeId !== '') {
    const numeric = Number(assigneeId);

    if (!Number.isInteger(numeric) || numeric <= 0) {
      errors.assigneeId = 'assigneeId must be a positive integer';
    } else if (!await userExists(numeric)) {
      errors.assigneeId = 'Assignee does not exist';
    }
  }

  return errors;
}

async function validateTaskCreate(req, res, next) {
  const errors = await collectTaskErrors(req.body, true);
  if (Object.keys(errors).length > 0) {
    return fail(res, errors);
  }
  next();
}

async function validateTaskUpdate(req, res, next) {
  const errors = await collectTaskErrors(req.body, false, parseId(req.params.id) ?? undefined);
  if (Object.keys(errors).length > 0) {
    return fail(res, errors);
  }
  next();
}

export {
  TASK_STATUSES,
  TASK_PRIORITIES,
  validateProjectCreate,
  validateProjectUpdate,
  validateTaskCreate,
  validateTaskUpdate,
};
