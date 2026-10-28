// Single source of truth for the JWT used by every axios instance.
//
// P1's client (api/p1Api.js) and P2's client (api/client.js) are separate
// instances because they treat responses differently, but they must send the
// same token. Both attach it from here, and AuthContext writes it here.

export const TOKEN_KEY = "hackforge_token";
export const USER_KEY = "hackforge_user";

let authToken = typeof localStorage === "undefined"
  ? null
  : localStorage.getItem(TOKEN_KEY);

export function setAuthToken(newToken) {
  authToken = newToken || null;
}

export function getAuthToken() {
  return authToken;
}
