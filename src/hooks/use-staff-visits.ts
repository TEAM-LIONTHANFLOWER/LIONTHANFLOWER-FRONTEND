import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { LANGUAGE_LABEL_BY_SERVICE_LANGUAGE } from '@constants/languages';
import { toOrdinal } from '@constants/format';
import { api } from '@services/api';
import type { StaffVisitAssignment, StaffVisitList, StaffVisitSummary } from '@/types/staff';
import type { ServiceStatus, StoreVisit, VisitMode } from '@/types/visit';

export const staffVisitKeys = {
  all: ['staff-visits'] as const,
  current: () => [...staffVisitKeys.all, 'current'] as const,
};

/** 서버의 접객 방식 → 직원 홈 위쪽 탭이 쓰는 구분. */
function toVisitMode(summary: StaffVisitSummary): VisitMode {
  return summary.interactionStyle === 'SELF_GUIDED' ? 'solo' : 'with';
}

/**
 * 서버의 방문 상태 → 카드가 그리는 응대 단계.
 *
 * 서버는 무엇을 쓰는 중인지까지 나누지만(`ARC_IN_PROGRESS` / `VISIT_MEMORY_IN_PROGRESS`),
 * 카드는 `응대중` 한 가지로만 그리므로 셋을 하나로 접습니다.
 */
function toServiceStatus(status: StaffVisitSummary['status']): ServiceStatus {
  switch (status) {
    case 'WAITING_FOR_STAFF':
    case 'ONBOARDING':
      return 'waiting';
    case 'ACTIVE':
    case 'ARC_IN_PROGRESS':
    case 'VISIT_MEMORY_IN_PROGRESS':
      return 'in-progress';
    case 'COMPLETED':
    case 'CANCELED':
      return 'done';
  }
}

/**
 * 서버 방문 한 건 → 카드 한 장.
 *
 * 시안의 카드에는 있지만 서버에 없는 값이 둘 있습니다.
 * - 응대 시작 시각 — `응대중・08:24` 의 시각 부분이라, 없으면 `응대중` 만 나옵니다.
 * - 응대 언어 목록 — 고객은 언어를 하나만 고르므로 늘 한 줄입니다.
 */
function toStoreVisit(summary: StaffVisitSummary): StoreVisit {
  return {
    id: summary.visitId,
    name: summary.customerName,
    languages: [LANGUAGE_LABEL_BY_SERVICE_LANGUAGE[summary.serviceLanguage]],
    // 첫 방문이면 `arcCount` 가 0 이고, 지금 쓰게 될 것이 그 고객의 1번째 Arc 입니다.
    arcLabel: `${toOrdinal(Math.max(summary.arcCount, 1))} Arc`,
    request: summary.additionalRequest,
    mode: toVisitMode(summary),
    status: toServiceStatus(summary.status),
  };
}

/** 지금 매장에 들어와 있는 고객 목록. */
export function useStaffVisits() {
  return useQuery({
    queryKey: staffVisitKeys.current(),
    queryFn: () => api.get<StaffVisitList>('/api/staff/visits'),
    // 서버 모양을 화면 모양으로 옮기는 일은 여기서 끝냅니다. 화면은 카드만 받습니다.
    select: (data): readonly StoreVisit[] => (data?.visits ?? []).map(toStoreVisit),
  });
}

/** 기다리던 고객의 응대를 시작하고 자신을 담당자로 배정합니다. */
export function useAssignVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visitId: string) =>
      api.post<StaffVisitAssignment>(`/api/staff/visits/${visitId}/assignment`),
    onSuccess: () => {
      // 배정되면 그 카드의 상태와 버튼이 달라지므로 목록을 다시 읽습니다.
      queryClient.invalidateQueries({ queryKey: staffVisitKeys.current() });
    },
  });
}
