import { useMutation, useQuery } from '@tanstack/react-query';

import { api } from '@services/api';
import type {
  CustomerVisitSession,
  OnboardingSubmission,
  VisitEntry,
  VisitMatching,
  VisitOnboardingResult,
} from '@/types/visit';

export const visitKeys = {
  all: ['customer-visit'] as const,
  matching: (visitId: string) => [...visitKeys.all, 'matching', visitId] as const,
};

/**
 * 배정 여부를 다시 물어보는 간격.
 *
 * 서버가 배정 사실을 밀어 주지 않아(웹소켓·푸시가 없습니다) 고객 쪽에서 되물어야 합니다.
 * 매장에서 직원이 화면을 누르고 고객이 알아차리기까지의 체감을 기준으로 2 초로 둡니다.
 */
const MATCHING_POLL_INTERVAL_MS = 2000;

/**
 * 고객 로그인 — 서비스 진입과 온보딩 제출을 잇달아 보냅니다.
 *
 * 서버는 이 둘을 나눠 두었습니다.
 * 1. `POST /api/customers/visits` — 쿠키로 고객을 식별(없으면 생성)하고 새 방문을 엽니다.
 *    응답으로 `visitId` 를 주고, 이후 요청에 쓸 `customer_token` 쿠키를 함께 심습니다.
 * 2. `PATCH /api/customers/visits/{visitId}/onboarding` — 이름·언어·접객 방식을 저장하고
 *    방문을 진행 상태로 넘깁니다.
 *
 * 화면에서는 `Start to Journey` 한 번에 일어나는 일이라 훅 하나로 묶었습니다.
 * 진입을 화면 진입 시점에 미리 부르지 않는 이유는, 입력을 마치지 않고 나간 고객까지
 * 방문 기록이 생기기 때문입니다.
 */
export function useStartVisit() {
  return useMutation({
    mutationFn: async (submission: OnboardingSubmission): Promise<CustomerVisitSession> => {
      const entry = await api.post<VisitEntry>('/api/customers/visits');
      const result = await api.patch<VisitOnboardingResult>(
        `/api/customers/visits/${entry.visitId}/onboarding`,
        { body: submission }
      );

      return {
        visitId: result.visitId,
        // 방금 입력한 이름이 서버에 저장된 이름입니다.
        customerName: submission.name,
        status: result.status,
        // 보낸 값을 그대로 세션에 남깁니다. 서버가 되돌려주지 않아 여기서 잃으면 다시 알 길이 없습니다.
        serviceLanguage: submission.serviceLanguage,
        interactionStyle: submission.interactionStyle,
        additionalRequest: submission.additionalRequest,
      };
    },
  });
}

/** 담당 직원이 정해졌는지. 배정 전에는 `staffId` 가 비어 있습니다. */
export function isMatched(matching: VisitMatching | undefined): boolean {
  return matching?.staffId !== undefined && matching.staffId !== null;
}

/**
 * 직원 배정을 기다리는 고객이 자기 방문 상태를 되읽습니다 — `/matching` 이 씁니다.
 *
 * 직원이 `POST /api/staff/visits/{visitId}/assignment` 를 누르면 서버 상태가 `ACTIVE` 로
 * 바뀌고 `staffId` `staffName` `matchedAt` 이 채워집니다. 그때까지 짧은 간격으로 되묻고,
 * 배정이 끝나면 폴링을 멈춥니다.
 *
 * `visitId` 가 없으면(로그인을 거치지 않고 화면에 들어온 경우) 요청을 보내지 않습니다.
 */
export function useVisitMatching(visitId: string | null) {
  return useQuery({
    queryKey: visitKeys.matching(visitId ?? ''),
    queryFn: () => api.get<VisitMatching>(`/api/customers/visits/${visitId}/matching`),
    enabled: visitId !== null,
    // 기다리는 화면이라 캐시된 값을 그대로 쓰면 안 됩니다. 매번 서버에 다시 묻습니다.
    staleTime: 0,
    refetchInterval: (query) => (isMatched(query.state.data) ? false : MATCHING_POLL_INTERVAL_MS),
  });
}
