import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { LANGUAGE_LABEL_BY_SERVICE_LANGUAGE } from '@constants/languages';
import { toClockTime, toDotDate, toOrdinal } from '@constants/format';
import { api } from '@services/api';
import type { StaffVisitAssignment, StaffVisitList, StaffVisitSummary } from '@/types/staff';
import { SERVICE_STYLE_LABEL_KEY } from '@constants/onboarding';
import { MESSAGES } from '@constants/messages';
import type {
  MemoryCardContent,
  ServiceStatus,
  StoreVisit,
  VisitDay,
  VisitMode,
} from '@/types/visit';

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
 * 시각 문자열을 배지에 붙일 수 있을 때만 돌려줍니다.
 * 아직 배정되지 않았거나 읽을 수 없는 값이면 배지에 `응대중` 만 남습니다.
 */
function toBadgeTime(isoDate: string | undefined): string | undefined {
  const time = toClockTime(isoDate);
  return time === '' ? undefined : time;
}

/**
 * 서버 방문 한 건 → 카드 한 장.
 *
 * 응대 언어는 고객이 하나만 고르므로 늘 한 줄입니다.
 */
function toStoreVisit(summary: StaffVisitSummary, today: string): StoreVisit {
  const visitedOn = toDotDate(summary.visitedAt);

  return {
    id: summary.visitId,
    name: summary.customerName,
    languages: [LANGUAGE_LABEL_BY_SERVICE_LANGUAGE[summary.serviceLanguage]],
    // 첫 방문이면 `arcCount` 가 0 이고, 지금 쓰게 될 것이 그 고객의 1번째 Arc 입니다.
    arcLabel: `${toOrdinal(Math.max(summary.arcCount, 1))} Arc`,
    arcCount: summary.arcCount,
    interactionStyle: summary.interactionStyle,
    serviceLanguage: summary.serviceLanguage,
    request: summary.additionalRequest,
    mode: toVisitMode(summary),
    status: toServiceStatus(summary.status),
    startedAt: toBadgeTime(summary.matchedAt),
    // 서버가 방문 시각을 비워 보내면 지금 매장에 들어와 있는 고객이므로 오늘로 묶습니다.
    visitedOn: visitedOn === '' ? today : visitedOn,
  };
}

/**
 * 방문 목록 → 날짜 묶음. 최근 날짜가 위에 옵니다.
 *
 * 서버는 날짜순으로 세워 주지 않습니다 — 응대 중인 방문이 먼저 옵니다. 날짜 사이 순서만
 * 여기서 다시 세우고, 같은 날 안에서는 서버가 준 차례를 그대로 둡니다.
 * `YYYY.MM.DD` 는 자리 수가 고정이라 문자열로 비교해도 날짜 순서와 같습니다.
 */
export function toVisitDays(visits: readonly StoreVisit[]): readonly VisitDay[] {
  const byDate = new Map<string, StoreVisit[]>();

  for (const visit of visits) {
    const sameDay = byDate.get(visit.visitedOn);

    if (sameDay === undefined) {
      byDate.set(visit.visitedOn, [visit]);
    } else {
      sameDay.push(visit);
    }
  }

  return [...byDate.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, dayVisits]) => ({ date, visits: dayVisits }));
}

/** 지금 매장에 들어와 있는 고객 목록. */
export function useStaffVisits() {
  return useQuery({
    queryKey: staffVisitKeys.current(),
    queryFn: () => api.get<StaffVisitList>('/api/staff/visits'),
    // 서버 모양을 화면 모양으로 옮기는 일은 여기서 끝냅니다. 화면은 카드만 받습니다.
    select: (data): readonly StoreVisit[] => {
      const today = toDotDate(new Date().toISOString());
      return (data?.visits ?? []).map((summary) => toStoreVisit(summary, today));
    },
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

/**
 * 방문 한 건 → 직원 고객 상세의 프로필 면.
 *
 * 시안(2-1 Arc 조회)의 여섯 줄을 방문 목록 응답만으로 채웁니다.
 * 매장 이름만 방문에 실려 오지 않아 로그인한 직원의 근무 매장에서 가져옵니다 —
 * 목록이 그 매장에 들어온 고객만 주므로 둘은 늘 같은 곳입니다.
 *
 * 직원 화면은 번역 대상이 아니라 한국어로 적습니다.
 */
export function toCustomerProfileCard(
  visit: StoreVisit,
  storeName: string | undefined
): MemoryCardContent {
  const lines = [
    visit.name.toUpperCase(),
    visit.arcCount > 0 ? '기존 고객' : '신규 고객',
    `Arc ${visit.arcCount}`,
    visit.languages.join(' · '),
    MESSAGES.ko[SERVICE_STYLE_LABEL_KEY[visit.interactionStyle]],
  ];

  if (storeName !== undefined) {
    lines.push(`현재 방문: ${storeName}`);
  }
  if (visit.request !== undefined) {
    lines.push(`추가 요구사항 : ${visit.request}`);
  }

  return { page: 'arc', title: visit.name, lines };
}
