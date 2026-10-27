import api from './client';

export function getMessages(projectId) {
  if (projectId === undefined || projectId === null) {
    return api.get('/messages');
  }
  return api.get('/messages', { params: { projectId } });
}

export function createMessage(data) {
  return api.post('/messages', data);
}

export function deleteMessage(id) {
  return api.delete(`/messages/${id}`);
}
