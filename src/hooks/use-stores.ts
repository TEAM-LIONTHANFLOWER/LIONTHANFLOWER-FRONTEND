import { useQuery } from '@tanstack/react-query';

import { api } from '@services/api';
import type { StoreSummary } from '@/types/store';

export const storeKeys = {
  all: ['stores'] as const,
  search: (query: string) => [...storeKeys.all, 'search', query] as const,
  byCode: (code: string) => [...storeKeys.all, 'by-code', code] as const,
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

/**
 * 매장 코드 한 개로 그 매장을 찾습니다 — NFC 태그로 들어온 고객의 `/login` 이 씁니다.
 *
 * 태그에는 사람이 읽을 이름이 아니라 `MCM-SEOUL` 같은 짧은 코드가 적혀 있습니다.
 * 이름이 바뀌어도 태그를 다시 굽지 않아도 되기 때문입니다. 화면에 띄울 이름은 여기서 얻습니다.
 *
 * 코드 전용 엔드포인트가 없어 이름·코드 검색(`GET /api/stores`)을 그대로 쓰고, 코드가 정확히
 * 같은 한 곳만 골라냅니다. 검색은 부분 일치라 `MCM-SEOUL` 로 물어도 `MCM-SEOUL-2` 가 함께
 * 딸려 올 수 있어서, 고른 뒤에 코드를 한 번 더 맞춰 봐야 엉뚱한 매장을 띄우지 않습니다.
 *
 * 코드가 없으면(태그를 거치지 않은 진입) 요청을 보내지 않고, 맞는 매장이 없으면 `null` 입니다.
 * 둘 다 화면에서 기존 고정 매장명으로 되돌아가는 신호로 씁니다.
 */
export function useStoreByCode(code: string | null) {
  return useQuery({
    queryKey: storeKeys.byCode(code ?? ''),
    queryFn: async () => {
      // `enabled` 가 막아 주지만 타입만으로는 알 수 없어 한 번 더 좁힙니다.
      if (code === null) {
        return null;
      }

      const matches = await api.get<StoreSummary[]>('/api/stores', { query: { query: code } });
      const wanted = code.toLowerCase();

      return matches.find((store) => store.code.toLowerCase() === wanted) ?? null;
    },
    enabled: code !== null,
  });
}
