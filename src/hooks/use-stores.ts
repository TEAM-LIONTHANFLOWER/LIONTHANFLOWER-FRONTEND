import { useQuery } from '@tanstack/react-query';

import { api } from '@services/api';
import type { StoreSummary } from '@/types/store';

export const storeKeys = {
  all: ['stores'] as const,
  search: (query: string) => [...storeKeys.all, 'search', query] as const,
};

/**
 * 이름이나 코드로 매장을 찾습니다.
 *
 * 직원 프로필 등록(`POST /api/staff/me/profile`)이 근무 매장을 UUID 로만 받아서,
 * `/staff/login` 의 `Working At` 이 이 검색으로 UUID 를 얻습니다.
 *
 * 빈 문자열을 넘기면 서버가 전체 목록을 돌려줍니다 — 아직 아무것도 치지 않은 상태에서
 * 고를 수 있는 매장을 보여주는 데 씁니다. 인증이 필요 없는 공개 엔드포인트라
 * 로그인 전에도 부를 수 있습니다.
 */
export function useStoreSearch(query: string) {
  return useQuery({
    queryKey: storeKeys.search(query),
    queryFn: () => api.get<StoreSummary[]>('/api/stores', { query: { query } }),
  });
}
