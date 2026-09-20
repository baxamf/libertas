import "server-only";

export const API_BASE = process.env.API_URL ?? "http://localhost:5000";
export const ACCESS_COOKIE_NAME =
  process.env.JWT_ACCESS_COOKIE_NAME ?? "access_token";
export const REFRESH_COOKIE_NAME =
  process.env.JWT_REFRESH_COOKIE_NAME ?? "refresh_token";
export const ACCESS_SECRET = process.env.JWT_SECRET;
export const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
