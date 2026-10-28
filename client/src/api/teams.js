import api from './client';

// P1's endpoints return { data: { teams } } / { data: { team } }. P2's client
// unwraps the outer envelope, so these resolve to { teams } / { team }.

export function getTeams() {
  return api.get('/teams');
}

export function getTeam(id) {
  return api.get(`/teams/${id}`);
}
