import api from './client';

export function getFiles(projectId) {
  return api.get('/files', { params: { projectId } });
}

export function uploadFile(file, projectId) {
  const formData = new FormData();
  formData.append('projectId', projectId);
  formData.append('file', file);
  return api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function downloadFile(id) {
  return api.get(`/files/${id}`, { responseType: 'blob' });
}

export function deleteFile(id) {
  return api.delete(`/files/${id}`);
}
