import { projects, nextId } from '../data/store.js';

function getProjects(req, res) {
  res.status(200).json({ success: true, data: projects });
}

function createProject(req, res) {
  const { name, description } = req.body;

  const project = {
    id: nextId(),
    name: name.trim(),
    description: typeof description === 'string' ? description : '',
    createdAt: new Date().toISOString(),
  };

  projects.push(project);
  res.status(201).json({ success: true, data: project });
}

function getProjectById(req, res) {
  const id = Number(req.params.id);
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  res.status(200).json({ success: true, data: project });
}

function updateProject(req, res) {
  const id = Number(req.params.id);
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  const { name, description } = req.body;

  if (name !== undefined) {
    project.name = name.trim();
  }

  if (description !== undefined) {
    project.description = String(description);
  }

  res.status(200).json({ success: true, data: project });
}

function deleteProject(req, res) {
  const id = Number(req.params.id);
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  projects.splice(index, 1);
  res.status(200).json({ success: true, data: { id } });
}

export { getProjects, createProject, getProjectById, updateProject, deleteProject };