/**
 * 서버 API 호출 공통 래퍼.
 * 모든 네트워크 요청은 이 모듈을 거치도록 합니다.
 *
 * 이 서버는 두 가지 약속을 갖고 있어 래퍼가 그것을 흡수합니다.
 * 1. 모든 응답이 `{ success, data }` 봉투에 담겨 옵니다 → 호출부에는 `data` 만 돌려줍니다.
 * 2. 인증이 헤더가 아니라 쿠키(`customer_token` / `staffToken`)로 오갑니다
 *    → 요청에 `credentials: 'include'` 를 붙여 쿠키를 함께 보냅니다.
 */
import { API_BASE_URL, API_TIMEOUT_MS } from '@constants/config';
import type {
  ApiEnvelope,
  ApiErrorBody,
  ApiFieldError,
  ApiRequestOptions,
  HttpMethod,
  QueryValue,
} from '@/types/api';

/** 서버가 2xx 이외의 상태 코드를 반환했을 때 던지는 에러 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
    /** 검증 실패(400)일 때 어떤 필드가 문제였는지. 그 외에는 비어 있습니다. */
    readonly fieldErrors: readonly ApiFieldError[] = []
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
      // 인증 쿠키를 주고받기 위해 필요합니다. 웹에서는 서버가 이 출처를
      // `Access-Control-Allow-Origin` 에 명시하고 `...-Allow-Credentials: true` 를 함께 내려줘야 합니다.
      credentials: 'include',
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await parseJson<ApiErrorBody>(response);
      throw new ApiError(
        response.status,
        errorBody?.error?.message ?? `요청에 실패했습니다. (${response.status})`,
        errorBody?.error?.code,
        errorBody?.error?.fieldErrors ?? []
      );
    }

    // 성공 응답도 `{ success, data }` 로 감싸져 오므로 봉투를 벗겨 돌려줍니다.
    const envelope = await parseJson<ApiEnvelope<T>>(response);
    return (envelope?.data ?? null) as T;
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
