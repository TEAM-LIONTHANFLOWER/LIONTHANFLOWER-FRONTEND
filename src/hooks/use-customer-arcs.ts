import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { toDotDate, toLetterDate, toOrdinal } from '@constants/format';
import { api } from '@services/api';
import type {
  ArcDetail,
  ArcEntry,
  ArcFinalization,
  ArcListItem,
  ArcProduct,
  LetterSection,
} from '@/types/arc';
import type { LocalizedText } from '@/types/i18n';

export const arcKeys = {
  all: ['customer-arcs'] as const,
  list: () => [...arcKeys.all, 'list'] as const,
  detail: (arcId: string) => [...arcKeys.all, 'detail', arcId] as const,
};

/**
 * 서버가 내려주는 편지 글은 한 벌뿐이고, 그게 맞습니다.
 *
 * 고객은 온보딩에서 고른 언어(`serviceLanguage`)로 방문 하나를 끝까지 보냅니다 —
 * `Language` 칩이 `/login` 에만 있어 로그인 뒤에는 언어가 바뀌지 않습니다. 그래서 서버가
 * 그 방문의 언어로 쓴 문장 하나를 주면 충분하고, 언어별 묶음을 받을 이유가 없습니다.
 *
 * 화면 타입(`LocalizedText`)이 그보다 넓어서 다섯 칸에 같은 문장을 넣어 둡니다. 편지지는
 * 지금 언어의 칸을 꺼내 쓰므로, 그리는 결과는 **서버가 보낸 문장 그대로** 입니다.
 * 임시 방편이 아니라 넓은 타입에 맞추는 어댑터라, 서버가 언어를 맞춰 보내도 이대로 둡니다.
 */
function asIs(line: string): LocalizedText {
  return { ko: line, en: line, zh: line, ja: line, ru: line };
}

/** `A Bag` `Black / Small` 두 줄. 색·사이즈가 없으면 이름 줄만 남깁니다. */
function toProductLines(product: ArcProduct): LocalizedText[] {
  const spec = [product.color, product.option].filter((value) => value !== undefined).join(' / ');

  return spec.length === 0
    ? [asIs(`Selected ${product.productName}`)]
    : [asIs(`Selected ${product.productName}`), asIs(spec)];
}

/**
 * 상세 응답 → 편지 본문.
 * 서버가 비워 보낸 항목은 소제목째 빼고, 시안의 세 단락 순서는 그대로 지킵니다.
 */
function toLetterSections(detail: ArcDetail): LetterSection[] {
  const sections: LetterSection[] = [];

  const momentLines: LocalizedText[] = [];
  if (detail.momentSummary !== undefined) {
    momentLines.push(asIs(detail.momentSummary));
  }
  for (const product of detail.purchasedProducts ?? []) {
    momentLines.push(...toProductLines(product));
  }
  if (momentLines.length > 0) {
    sections.push({ id: 'moment', title: 'Your MCM Moment', lines: momentLines });
  }

  const preferences = detail.preferences ?? [];
  if (preferences.length > 0) {
    sections.push({
      id: 'preference',
      title: 'Your Preference',
      bulleted: true,
      lines: preferences.map(asIs),
    });
  }

  if (detail.momentToRemember !== undefined) {
    sections.push({
      id: 'remember',
      title: 'A Moment to Remember',
      lines: [asIs(detail.momentToRemember)],
    });
  }

  return sections;
}

/** 상세 응답 → 봉투 한 장과 그 안의 편지. */
function toArcEntry(detail: ArcDetail): ArcEntry {
  const ordinal = toOrdinal(detail.arcNumber);
  // 고객이 저장했으면 그 시각이, 아직이면 직원이 보낸 시각이 그 Arc 의 날짜입니다.
  const issuedAt = detail.finalizedAt ?? detail.sharedAt;

  return {
    id: detail.arcId,
    envelopeTitle: `Your ${ordinal} Arc`,
    store: detail.storeName,
    date: toDotDate(issuedAt),
    letter: {
      title: `${detail.customerName}\u2019s ${ordinal} Arc`,
      place: `${detail.storeName} \u00b7 ${detail.countryCode}`,
      issuedOn: toLetterDate(issuedAt),
      sections: toLetterSections(detail),
    },
  };
}

/** 고객이 받은 Arc 목록. 편지 본문은 여기 없고 상세에서 옵니다. */
export function useCustomerArcs() {
  return useQuery({
    queryKey: arcKeys.list(),
    queryFn: () => api.get<ArcListItem[]>('/api/customers/arcs'),
  });
}

/**
 * 화면이 그릴 Arc 봉투와 편지 전부.
 *
 * 서버가 목록과 상세를 나눠 두었는데, 목록에는 매장 이름도 편지 본문도 없습니다.
 * 봉투 겉면에 매장이 적히고 봉투를 누르면 곧바로 편지가 나와야 해서, 목록을 받은 뒤
 * 각 Arc 의 상세를 함께 불러 한 벌로 합칩니다. Arc 는 방문 횟수만큼만 쌓여 몇 건 되지 않고,
 * 상세는 `staleTime` 동안 캐시에 남아 화면을 오갈 때 다시 요청되지 않습니다.
 */
export function useCustomerArcEntries() {
  const queryClient = useQueryClient();
  const list = useCustomerArcs();

  const details = useQueries({
    queries: (list.data ?? []).map((item) => ({
      queryKey: arcKeys.detail(item.arcId),
      queryFn: () => api.get<ArcDetail>(`/api/customers/arcs/${item.arcId}`),
    })),
    combine: (results) => ({
      entries: results
        .map((result) => result.data)
        .filter((detail): detail is ArcDetail => detail !== undefined)
        .map(toArcEntry),
      isPending: results.some((result) => result.isPending),
      isError: results.some((result) => result.isError),
    }),
  });

  return {
    entries: details.entries,
    // 목록을 받아야 상세를 부를 수 있으므로 둘 중 하나라도 진행 중이면 아직 로딩입니다.
    isPending: list.isPending || details.isPending,
    isError: list.isError || details.isError,
    // 목록만 다시 부르면 이미 실패한 상세는 그대로 남습니다. 둘 다 무효화해야 화면이 복구됩니다.
    refetch: () => queryClient.invalidateQueries({ queryKey: arcKeys.all }),
  };
}

/**
 * 고객이 받은 Arc 를 최종 저장합니다. 이 시점에 방문도 함께 완료됩니다.
 * 저장하면 상태가 `FINALIZED` 로 바뀌므로 목록과 상세를 모두 다시 읽습니다.
 */
export function useFinalizeArc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (arcId: string) =>
      api.post<ArcFinalization>(`/api/customers/arcs/${arcId}/finalize`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arcKeys.all });
    },
  });
}
