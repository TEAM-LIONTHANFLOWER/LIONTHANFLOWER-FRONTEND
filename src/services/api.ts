/**
 * 서버 API 호출 공통 래퍼.
 * 모든 네트워크 요청은 이 모듈을 거치도록 합니다.
 */
import { API_BASE_URL, API_TIMEOUT_MS } from '@constants/config';
import type { ApiErrorBody, ApiRequestOptions, HttpMethod, QueryValue } from '@/types/api';

/** 서버가 2xx 이외의 상태 코드를 반환했을 때 던지는 에러 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let authToken: string | null = null;

/** 로그인 성공 후 받은 토큰을 등록합니다. 로그아웃 시에는 null 을 넘깁니다. */
export function setAuthToken(token: string | null) {
  authToken = token;
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const base = API_BASE_URL.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  const entries = Object.entries(query ?? {}).filter(
    ([, value]) => value !== undefined && value !== null
  );

  if (entries.length === 0) {
    return `${base}${suffix}`;
  }

  const search = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return `${base}${suffix}?${search}`;
}

/** 바디가 비어 있거나 JSON 이 아닌 응답(204 등)은 null 로 처리합니다. */
async function parseJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { body, headers, query, signal, timeoutMs = API_TIMEOUT_MS } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  // 호출부가 넘긴 취소 신호도 함께 반영합니다.
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller);

  try {
    const response = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(authToken === null ? {} : { Authorization: `Bearer ${authToken}` }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await parseJson<ApiErrorBody>(response);
      throw new ApiError(
        response.status,
        errorBody?.message ?? `요청에 실패했습니다. (${response.status})`,
        errorBody?.code
      );
    }

    return (await parseJson<T>(response)) as T;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

export const api = {
  get: <T>(path: string, options?: ApiRequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, options?: ApiRequestOptions) => request<T>('POST', path, options),
  put: <T>(path: string, options?: ApiRequestOptions) => request<T>('PUT', path, options),
  patch: <T>(path: string, options?: ApiRequestOptions) => request<T>('PATCH', path, options),
  delete: <T>(path: string, options?: ApiRequestOptions) => request<T>('DELETE', path, options),
};
