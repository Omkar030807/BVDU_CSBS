import type { HealthStatus } from '../types/health';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

interface ApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  public constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiRequest = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('The HMS API could not be reached.');
  }

  if (response.status === 204) return undefined as T;

  const payload = (await response.json()) as T & ApiErrorPayload;
  if (!response.ok) {
    throw new ApiError(
      payload.error?.message ?? 'The request could not be completed.',
      response.status,
      payload.error?.code,
      payload.error?.details,
    );
  }

  return payload;
};

export const fetchHealth = async (signal?: AbortSignal): Promise<HealthStatus> => {
  try {
    return await apiRequest<HealthStatus>('/health', { method: 'GET', signal });
  } catch (error) {
    if (error instanceof ApiError && error.status === 503) {
      throw new ApiError('The database health check is degraded.', 503, 'HEALTH_DEGRADED');
    }
    throw error;
  }
};
