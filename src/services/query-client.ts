import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@services/api';

/**
 * 4xx 는 같은 요청을 다시 보내도 결과가 같으므로 즉시 포기합니다.
 * 그 외(네트워크 오류, 5xx)는 2회까지 재시도합니다.
 */
function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }

  return failureCount < 2;
}

/**
 * QueryClient 는 컴포넌트 안에서 만듭니다.
 * 웹 정적 렌더링(빌드 타임 prerender)에서 인스턴스가 공유되는 것을 막기 위해서입니다.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        /** 1분 안에 다시 마운트되면 네트워크를 타지 않습니다. */
        staleTime: 60_000,
        gcTime: 5 * 60_000,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
