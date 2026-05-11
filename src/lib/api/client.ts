import { Ohgnoy_BackendAPI } from '@/lib/constants';

type RequestOptions = Omit<RequestInit, 'headers' | 'method' | 'body'> & {
  token?: string;
  headers?: Record<string, string>;
};

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers: customHeaders = {}, ...rest } = options;

  const headers: Record<string, string> = { ...customHeaders };

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${Ohgnoy_BackendAPI}${path}`, {
    ...rest,
    method,
    headers,
    body:
      body instanceof FormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
  });

  return response.json();
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),

  delete: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('DELETE', path, body, options),
};
