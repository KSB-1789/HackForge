import { tasks, nextId } from '../data/store.js';

function getTasks(req, res) {
  const { projectId } = req.query;

  if (projectId === undefined) {
    return res.status(200).json({ success: true, data: tasks });
  }

  const id = Number(projectId);
  if (Number.isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: { projectId: 'projectId must be a number' },
    });
  }

  const filtered = tasks.filter((task) => task.projectId === id);
  res.status(200).json({ success: true, data: filtered });
}

function createTask(req, res) {
  const { projectId, title, description, assigneeId, status, priority } = req.body;

  const task = {
    id: nextId(),
    projectId: Number(projectId),
    title: title.trim(),
    description: typeof description === 'string' ? description : '',
    assigneeId: assigneeId === undefined ? null : assigneeId,
    status: status === undefined ? 'todo' : status,
    priority: priority === undefined ? 'medium' : priority,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  res.status(201).json({ success: true, data: task });
}

function getTaskById(req, res) {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  res.status(200).json({ success: true, data: task });
}

function updateTask(req, res) {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  const { projectId, title, description, assigneeId, status, priority } = req.body;

  if (projectId !== undefined) {
    task.projectId = Number(projectId);
  }
  if (title !== undefined) {
    task.title = title.trim();
  }
  if (description !== undefined) {
    task.description = String(description);
  }
  if (assigneeId !== undefined) {
    task.assigneeId = assigneeId;
  }
  if (status !== undefined) {
    task.status = status;
  }
  if (priority !== undefined) {
    task.priority = priority;
  }

  res.status(200).json({ success: true, data: task });
}

function deleteTask(req, res) {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  tasks.splice(index, 1);
  res.status(200).json({ success: true, data: { id } });
}

export { getTasks, createTask, getTaskById, updateTask, deleteTask };
