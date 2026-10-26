import api from './client';

export function getTasks(projectId) {
  if (projectId === undefined || projectId === null) {
    return api.get('/tasks');
  }
  return api.get('/tasks', { params: { projectId } });
}

export function getTask(id) {
  return api.get(`/tasks/${id}`);
}

export function createTask(data) {
  return api.post('/tasks', data);
}

export function updateTask(id, data) {
  return api.put(`/tasks/${id}`, data);
}

export function deleteTask(id) {
  return api.delete(`/tasks/${id}`);
}
