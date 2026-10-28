import api from './client';

// P1's /api/users resolves to { users } after the P2 client unwraps it.
export function getUsers() {
  return api.get('/users');
}

export function getUser(id) {
  return api.get(`/users/${id}`);
}
