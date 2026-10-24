import { projects } from '../data/store.js';

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

function collectTaskErrors(body, isCreate) {
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
  const errors = collectTaskErrors(req.body, false);
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
