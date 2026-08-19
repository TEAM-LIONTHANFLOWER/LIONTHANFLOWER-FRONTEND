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

/**
 * 서버 공통 응답 봉투.
 *
 * 이 서버는 성공·실패를 가리지 않고 모든 응답을 `{ success, data }` 로 한 겹 감싸서 내려줍니다.
 * 화면과 쿼리 훅은 이 봉투를 몰라도 되도록 `@services/api` 가 벗겨서 `data` 만 돌려줍니다.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
}

/** 검증에 실패한 필드 하나. 서버가 `error.fieldErrors` 에 담아 보냅니다. */
export interface ApiFieldError {
  field?: string;
  message?: string;
}

/**
 * 서버가 실패 응답에서 내려주는 공통 에러 바디.
 * 예) `{"success":false,"error":{"code":"COMMON-401","message":"인증이 필요합니다.","fieldErrors":[]}}`
 */
export interface ApiErrorBody {
  success?: boolean;
  error?: {
    code?: string;
    message?: string;
    fieldErrors?: ApiFieldError[];
  };
}
