export const users = [];
export const teams = [];

let lastUserId = 0;
let lastTeamId = 0;

export function nextUserId() {
    lastUserId += 1;
    return lastUserId;
}

export function nextTeamId() {
    lastTeamId += 1;
    return lastTeamId;
}