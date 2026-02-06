// Local storage utilities for managing auth state client-side

const AUTH_TOKEN_KEY = "uzimacare_auth_token";
const USER_KEY = "uzimacare_user";

export function saveAuthState(token: string, user: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getAuthState() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    if (token && userStr) {
      return {
        token,
        user: JSON.parse(userStr),
      };
    }
  }
  return null;
}

export function clearAuthState() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
