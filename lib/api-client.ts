/**
 * Thin fetch wrapper for the .NET backend + FastAPI AI service (PRD Section 9).
 * The .NET API is live at NEXT_PUBLIC_API_URL; the AI service is not up yet.
 * Requests automatically carry the stored JWT (lib/auth/token.ts) as a Bearer
 * token once logged in via lib/auth/api-auth.ts.
 */
import { getToken } from "@/lib/auth/token";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  baseUrl: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!baseUrl) {
    throw new ApiError(
      `No API base URL configured for "${path}". Set NEXT_PUBLIC_API_URL / NEXT_PUBLIC_AI_SERVICE_URL once the backend is live.`,
      0
    );
  }

  const token = getToken();
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      // no JSON body
    }
    throw new ApiError(`Request to ${path} failed with ${res.status}`, res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(API_BASE_URL, path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(API_BASE_URL, path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(API_BASE_URL, path, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: RequestInit) => request<T>(API_BASE_URL, path, { ...options, method: "DELETE" }),
};

export const aiApi = {
  get: <T>(path: string, options?: RequestInit) => request<T>(AI_SERVICE_URL, path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(AI_SERVICE_URL, path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
};
