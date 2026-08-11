export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** 쿼리 스트링으로 직렬화 가능한 값 */
export type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions {
  /** 쿼리 스트링으로 붙일 값. null / undefined 인 항목은 제외됩니다. */
  query?: Record<string, QueryValue>;
  /** JSON 으로 직렬화할 요청 바디 */
  body?: unknown;
  /** 요청별 추가 헤더 */
  headers?: Record<string, string>;
  /** 기본 타임아웃을 덮어쓸 값 (ms) */
  timeoutMs?: number;
  /** 호출부에서 직접 요청을 취소하고 싶을 때 사용 */
  signal?: AbortSignal;
}

/** 서버가 실패 응답에서 내려주는 공통 에러 바디 */
export interface ApiErrorBody {
  message?: string;
  code?: string;
}
