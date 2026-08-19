import { useQuery } from '@tanstack/react-query';

import { toLetterDate, toSameText } from '@constants/format';
import { api } from '@services/api';
import { useVisitStore } from '@stores/visit-store';
import type { LetterContent } from '@/types/arc';
import type { NotificationView } from '@/types/notification';
import type { VisitMemoryDetail } from '@/types/visit';

export const notificationKeys = {
  all: ['customer-notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
};

export const visitMemoryKeys = {
  all: ['customer-visit-memory'] as const,
  detail: (visitMemoryId: string) => [...visitMemoryKeys.all, 'detail', visitMemoryId] as const,
};

/** 고객이 받은 알림 목록. 지금은 Visit Memory 도착 알림 한 종류뿐입니다. */
export function useCustomerNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => api.get<NotificationView[]>('/api/customers/notifications'),
  });
}

/**
 * 가장 최근에 도착한 Visit Memory 의 식별자.
 *
 * 서버가 목록을 어떤 차례로 줄지 정해 두지 않아 `createdAt` 으로 직접 고릅니다.
 */
function latestVisitMemoryId(notifications: readonly NotificationView[]): string | undefined {
  const arrived = notifications.filter((notification) => notification.type === 'VISIT_MEMORY');

  if (arrived.length === 0) {
    return undefined;
  }

  return arrived.reduce((latest, candidate) =>
    candidate.createdAt > latest.createdAt ? candidate : latest
  ).resourceId;
}

/**
 * 상세 응답 → 편지지 한 장.
 *
 * 서버가 본문을 `summary` 한 덩이로 주기 때문에 단락도 하나입니다. 시안은 소제목 셋으로
 * 나뉘어 있는데 나눌 근거가 응답에 없어, 소제목 없이 글만 얹습니다.
 * 서버가 토막 내어 보내기 시작하면 그때 소제목을 답니다.
 */
function toLetter(detail: VisitMemoryDetail, customerName: string | undefined): LetterContent {
  const summary = detail.summary ?? '';

  return {
    title: customerName === undefined ? 'Visit Memory' : `${customerName}’s Visit Memory`,
    place: `${detail.storeName} · ${detail.countryCode}`,
    issuedOn: toLetterDate(detail.finalizedAt),
    sections: summary.length === 0 ? [] : [{ id: 'summary', lines: [toSameText(summary)] }],
  };
}

/**
 * `Visit Memory` 팝업이 보여줄 편지.
 *
 * 서버는 본문을 바로 주지 않고 두 번에 나눠 줍니다 — 직원이 전송하면 고객에게 알림이
 * 하나 생기고, 그 알림의 `resourceId` 가 곧 `visitMemoryId` 입니다. 그래서 알림을 먼저 읽고
 * 거기서 얻은 식별자로 본문을 가져옵니다.
 *
 * 아직 받은 기록이 없으면 `letter` 가 비어 있고 오류도 아닙니다 — 팝업이 안내 문구를 그립니다.
 */
export function useCustomerVisitMemory() {
  const customerName = useVisitStore((state) => state.session?.customerName);

  const notifications = useCustomerNotifications();
  const visitMemoryId =
    notifications.data === undefined ? undefined : latestVisitMemoryId(notifications.data);

  const memory = useQuery({
    queryKey: visitMemoryKeys.detail(visitMemoryId ?? ''),
    queryFn: () => api.get<VisitMemoryDetail>(`/api/customers/visit-memories/${visitMemoryId}`),
    enabled: visitMemoryId !== undefined,
  });

  return {
    letter: memory.data === undefined ? undefined : toLetter(memory.data, customerName),
    // 알림을 다 읽었는데 받은 기록이 없으면 더 기다릴 것이 없습니다.
    isPending: notifications.isPending || (visitMemoryId !== undefined && memory.isPending),
    isError: notifications.isError || memory.isError,
    refetch: () => {
      void notifications.refetch();
      void memory.refetch();
    },
  };
}
