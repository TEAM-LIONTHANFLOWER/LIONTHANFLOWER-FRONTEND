import { useMutation } from '@tanstack/react-query';

import { api } from '@services/api';
import type {
  CustomerVisitSession,
  OnboardingSubmission,
  VisitEntry,
  VisitOnboardingResult,
} from '@/types/visit';

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
      };
    },
  });
}
