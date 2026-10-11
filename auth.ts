"use client";

export function setSession(tokens: { access: string; refresh: string; role: string; email?: string }) {
  localStorage.setItem("sz_access", tokens.access);
  localStorage.setItem("sz_refresh", tokens.refresh);
  localStorage.setItem("sz_role", tokens.role);
  document.cookie = `role=${tokens.role}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=strict`;
}

export function clearSession() {
  localStorage.removeItem("sz_access");
  localStorage.removeItem("sz_refresh");
  localStorage.removeItem("sz_role");
  document.cookie = "role=; path=/; max-age=0";
}

export function getRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sz_role");
}
