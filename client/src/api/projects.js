import api from './client';

export function getProjects() {
  return api.get('/projects');
}

export function getProject(id) {
  return api.get(`/projects/${id}`);
}

export function createProject(data) {
  return api.post('/projects', data);
}

export function updateProject(id, data) {
  return api.put(`/projects/${id}`, data);
}

export function deleteProject(id) {
  return api.delete(`/projects/${id}`);
}
