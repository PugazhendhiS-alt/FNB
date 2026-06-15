const REMOTE_API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4173';

const buildRemoteUrl = (path: string) => {
  const normalizedBase = REMOTE_API_BASE_URL.replace(/\/+$/, '');
  return new URL(path, `${normalizedBase}/`).toString();
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as unknown as T;
  }

  return JSON.parse(text) as T;
};

const remoteFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const url = buildRemoteUrl(path);
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Remote API request failed: ${response.status} ${response.statusText} (${response.url})`);
  }

  return parseResponse<T>(response);
};

export const getRemoteResource = async <T>(path: string): Promise<T> => remoteFetch<T>(path, { method: 'GET' });

export const createRemoteResource = async <T, R>(path: string, body: T): Promise<R> =>
  remoteFetch<R>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateRemoteResource = async <T, R>(path: string, body: T): Promise<R> =>
  remoteFetch<R>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteRemoteResource = async (path: string): Promise<void> =>
  remoteFetch<void>(path, {
    method: 'DELETE',
  });
