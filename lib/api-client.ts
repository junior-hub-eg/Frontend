/**
 * Thin fetch wrapper for the .NET backend + FastAPI AI service (PRD Section 9).
 * Endpoints are not live yet (Sprint 1 backend deliverable), so callers should
 * expect this to point at NEXT_PUBLIC_API_URL once it exists — until then,
 * screens use the mock layer in lib/auth/mock-auth.ts instead of this client.
 */

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

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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
