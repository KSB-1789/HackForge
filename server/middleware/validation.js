import { projects, tasks } from '../data/store.js';

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

function validateProjectCreate(req, res, next) {
  const { name } = req.body;
  if (typeof name !== 'string' || name.trim().length < 3) {
    return fail(res, { name: 'Project name must be at least 3 characters' });
  }
  next();
}

function validateProjectUpdate(req, res, next) {
  const { name } = req.body;
  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 3)) {
    return fail(res, { name: 'Project name must be at least 3 characters' });
  }
  next();
}

function projectExists(projectId) {
  return projects.some((project) => project.id === Number(projectId));
}

function collectTaskErrors(body, isCreate, taskId) {
  const errors = {};
  const { title, projectId, status, priority } = body;

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
    } else if (!projectExists(projectId)) {
      errors.projectId = 'Project does not exist';
    }
  }

  const existingTask = taskId === undefined
    ? undefined
    : tasks.find((task) => task.id === taskId);
  const comparisonTitle = title === undefined ? existingTask?.title : title;
  const targetProjectId = projectIdProvided
    ? Number(projectId)
    : existingTask?.projectId;
  if (
    (isCreate || existingTask) &&
    typeof comparisonTitle === 'string' &&
    comparisonTitle.trim().length >= 3 &&
    targetProjectId !== undefined &&
    tasks.some((task) =>
      task.id !== taskId &&
      task.projectId === targetProjectId &&
      task.title.trim().toLowerCase() === comparisonTitle.trim().toLowerCase()
    )
  ) {
    errors.title = 'A task with this name already exists in this project';
  }

  if (status !== undefined && !TASK_STATUSES.includes(status)) {
    errors.status = `Status must be one of: ${TASK_STATUSES.join(', ')}`;
  }

  if (priority !== undefined && !TASK_PRIORITIES.includes(priority)) {
    errors.priority = `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`;
  }

  return errors;
}

function validateTaskCreate(req, res, next) {
  const errors = collectTaskErrors(req.body, true);
  if (Object.keys(errors).length > 0) {
    return fail(res, errors);
  }
  next();
}

function validateTaskUpdate(req, res, next) {
  const errors = collectTaskErrors(req.body, false, Number(req.params.id));
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
