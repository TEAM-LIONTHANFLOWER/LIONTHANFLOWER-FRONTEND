import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  ARC_FIELD_IDS,
  EXPLANATION_PREFERENCES,
  INTERACTION_PREFERENCES,
  PREFERRED_CATEGORIES,
  PREFERRED_COLORS,
  PREFERRED_STYLES,
  PURCHASE_CRITERIA,
  PURCHASE_DECISION_STYLES,
  toOtherFieldId,
} from '@constants/record-form';
import { toOrdinal } from '@constants/format';
import { staffVisitKeys, useStaffVisits } from '@hooks/use-staff-visits';
import { api } from '@services/api';
import { readChoices, readNote, readProducts } from '@stores/record-form-store';
import type { RecordFormValues } from '@/types/record-form';
import type { ArcInputSnapshot, StaffArcRevision } from '@/types/staff';
import type { MemoryCardContent, StoreVisit } from '@/types/visit';

export const staffArcKeys = {
  all: ['staff-arcs'] as const,
  detail: (arcId: string) => [...staffArcKeys.all, 'detail', arcId] as const,
};

/** 글을 쓰는 중일 때 다시 물어보는 간격. 다 써지면 폴링을 멈춥니다. */
const GENERATING_POLL_MS = 2_000;

/**
 * 담아 둔 제품 줄 → 서버가 받는 식별자 목록.
 *
 * 목록에서 고른 줄만 `variantId` 를 갖습니다. 글자만 치고 고르지 않은 줄은 서버가 가리킬
 * 대상이 없어 빼고 보냅니다 — `구매 제품` 이 그렇게 다 빠지면 배열이 비는데,
 * 서버가 빈 배열을 받지 않아 생성이 400 으로 막힙니다.
 */
function toVariantIds(values: RecordFormValues, sectionId: string): readonly string[] {
  return readProducts(values, sectionId)
    .map((product) => product.variantId)
    .filter((variantId): variantId is string => variantId !== undefined);
}

/**
 * 직원이 폼에 적은 값 한 벌 → Arc 생성 요청 바디.
 *
 * 열한 개 키는 값이 비어도 반드시 실어 보냅니다 — 스펙에 필수 표시가 없지만 서버가
 * 키 자체를 요구합니다(`docs/api-integration.md` 의 "막힌 것" 1). 반대로 `기타` 자유 입력과
 * 구매 결정 방식·직원 관찰은 적지 않았으면 키째 빼야 `적지 않음` 으로 전해집니다.
 *
 * 고른 보기를 서버 enum 으로 골라 내는 일은 보기를 만든 자리(`@constants/record-form`)가
 * 합니다. 여기서 enum 값을 다시 적지 않습니다.
 */
export function toArcSnapshot(values: RecordFormValues): ArcInputSnapshot {
  return {
    purchaseDate: values.texts[ARC_FIELD_IDS.purchaseDate] ?? '',
    purchaseCountry: values.texts[ARC_FIELD_IDS.purchaseCountry] ?? '',
    purchaseStore: values.texts[ARC_FIELD_IDS.purchaseStore] ?? '',
    purchasedProductVariantIds: toVariantIds(values, ARC_FIELD_IDS.purchasedProducts),
    preferredCategories: PREFERRED_CATEGORIES.select(
      readChoices(values, ARC_FIELD_IDS.preferredCategories)
    ),
    preferredColors: PREFERRED_COLORS.select(readChoices(values, ARC_FIELD_IDS.preferredColors)),
    preferredColorOther: readNote(values, toOtherFieldId(ARC_FIELD_IDS.preferredColors)),
    preferredStyles: PREFERRED_STYLES.select(readChoices(values, ARC_FIELD_IDS.preferredStyles)),
    preferredStyleOther: readNote(values, toOtherFieldId(ARC_FIELD_IDS.preferredStyles)),
    interestedProductVariantIds: toVariantIds(values, ARC_FIELD_IDS.interestedProducts),
    purchaseCriteria: PURCHASE_CRITERIA.select(readChoices(values, ARC_FIELD_IDS.purchaseCriteria)),
    purchaseCriterionOther: readNote(values, toOtherFieldId(ARC_FIELD_IDS.purchaseCriteria)),
    interactionPreferences: INTERACTION_PREFERENCES.select(
      readChoices(values, ARC_FIELD_IDS.interactionPreferences)
    ),
    explanationPreferences: EXPLANATION_PREFERENCES.select(
      readChoices(values, ARC_FIELD_IDS.explanationPreferences)
    ),
    // 서버가 하나만 받습니다. 줄 목록도 늘 하나만 고르게 되어 있어 첫 값을 씁니다.
    purchaseDecisionStyle: PURCHASE_DECISION_STYLES.select(
      readChoices(values, ARC_FIELD_IDS.decisionStyle)
    )[0],
    staffObservation: readNote(values, ARC_FIELD_IDS.observation),
  };
}

/**
 * 폼을 다 채웠는지. 서버가 빈 값을 받지 않는 네 가지만 봅니다.
 *
 * 생성 요청은 실패해도 무엇이 빠졌는지 알려주지 않아(`fieldErrors` 가 빈 배열입니다)
 * 보내기 전에 여기서 걸러 직원에게 무엇을 채워야 하는지 알려 줍니다.
 */
export function findMissingArcField(snapshot: ArcInputSnapshot): string | undefined {
  if (snapshot.purchaseDate.length === 0) {
    return '구매 날짜';
  }
  if (snapshot.purchaseCountry.length === 0) {
    return '구매 국가';
  }
  if (snapshot.purchaseStore.length === 0) {
    return '구매 매장';
  }
  if (snapshot.purchasedProductVariantIds.length === 0) {
    return '구매 제품';
  }

  return undefined;
}

/**
 * 직원이 쓴 Arc 미리보기. 생성·재생성·전송 응답과 같은 모양입니다.
 *
 * 글을 쓰는 중이면(`GENERATING`) 다 써질 때까지 스스로 다시 물어봅니다 —
 * 완료 화면이 그동안 `글을 쓰는 중입니다...` 를 보여주다가 글이 오면 카드로 바꿉니다.
 */
export function useStaffArc(arcId: string | null) {
  return useQuery({
    queryKey: staffArcKeys.detail(arcId ?? ''),
    queryFn: () => api.get<StaffArcRevision>(`/api/staff/arcs/${arcId}`),
    enabled: arcId !== null,
    refetchInterval: (query) =>
      query.state.data?.revisionStatus === 'GENERATING' ? GENERATING_POLL_MS : false,
  });
}

interface CreateArcInput {
  visitId: string;
  values: RecordFormValues;
}

/**
 * 방문 하나를 Arc 로 만듭니다. 서버가 입력을 받아 편지까지 써서 돌려줍니다.
 *
 * 아직 고객에게 가지 않습니다 — 작성 화면이 이어서 `useShareArc()` 를 부릅니다.
 */
export function useCreateArc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitId, values }: CreateArcInput) =>
      api.post<StaffArcRevision>(`/api/staff/visits/${visitId}/arcs`, {
        body: { inputSnapshot: toArcSnapshot(values) },
      }),
    onSuccess: (arc) => {
      // 방금 받은 것을 캐시에 심어 두면 완료 화면이 다시 묻지 않고 바로 그립니다.
      queryClient.setQueryData(staffArcKeys.detail(arc.arcId), arc);
    },
  });
}

interface RegenerateArcInput {
  arcId: string;
  values: RecordFormValues;
}

/**
 * 같은 Arc 에 새 리비전을 얹습니다. 완료 화면의 `다시 생성하기` 가 부릅니다.
 *
 * 새로 만든 리비전은 아직 고객에게 가지 않습니다 — 완료 화면이 이어서 전송까지 부릅니다.
 */
export function useRegenerateArc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ arcId, values }: RegenerateArcInput) =>
      api.post<StaffArcRevision>(`/api/staff/arcs/${arcId}/revisions`, {
        body: { inputSnapshot: toArcSnapshot(values) },
      }),
    onSuccess: (arc) => {
      queryClient.setQueryData(staffArcKeys.detail(arc.arcId), arc);
    },
  });
}

interface ShareArcInput {
  arcId: string;
  revisionId: string;
}

/**
 * 다 쓴 Arc 리비전을 고객에게 보냅니다. `READY` 인 리비전만 보낼 수 있습니다.
 *
 * 보내면 `arcStatus` 가 `SHARED` 가 되어 고객의 `/arc` 목록에 봉투가 하나 생깁니다.
 * 고객이 그 편지를 저장하면 그때 `FINALIZED` 가 됩니다 — 저장은 고객 화면에서 일어납니다.
 */
export function useShareArc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ arcId, revisionId }: ShareArcInput) =>
      api.post<StaffArcRevision>(`/api/staff/arcs/${arcId}/revisions/${revisionId}/share`),
    onSuccess: (arc) => {
      queryClient.setQueryData(staffArcKeys.detail(arc.arcId), arc);
      // 보내고 나면 방문 상태가 달라져 직원 홈의 카드도 바뀝니다.
      queryClient.invalidateQueries({ queryKey: staffVisitKeys.current() });
    },
  });
}

/**
 * Arc 한 건 → 카드 한 면.
 *
 * 시안(2-1-5)의 크림색 카드를 채웁니다. 매장·날짜 두 줄은 직원이 폼에 적은 값에서,
 * 그 아래 세 단락은 서버가 쓴 편지에서 옵니다. 소제목은 서버가 보내지 않아 시안의 영문
 * 그대로 두고, 내용이 비어 오는 단락은 소제목째 뺍니다.
 *
 * 완료 화면과 고객 상세의 기록 면이 같은 카드를 씁니다.
 */
export function toArcCard(arc: StaffArcRevision, title: string): MemoryCardContent {
  const lines: string[] = [];
  const snapshot = arc.inputSnapshot;

  if (snapshot !== undefined) {
    const place = [snapshot.purchaseStore, snapshot.purchaseCountry]
      .filter((value) => value.length > 0)
      .join(' · ');

    if (place.length > 0) {
      lines.push(place);
    }
    if (snapshot.purchaseDate.length > 0) {
      // 이미 `YYYY-MM-DD` 라 자리만 바꿉니다. 시각으로 되읽으면 시간대에 따라 하루가 밀립니다.
      lines.push(snapshot.purchaseDate.split('-').join('.'));
    }
  }

  const content = arc.generatedContent;

  if (content?.momentSummary !== undefined) {
    lines.push('YOUR MCM MOMENT', content.momentSummary);
  }

  const preferences = content?.preferences ?? [];
  if (preferences.length > 0) {
    lines.push('You seemed drawn to', ...preferences);
  }

  if (content?.momentToRemember !== undefined) {
    lines.push('Worth remembering', content.momentToRemember);
  }

  return { page: 'memory', title, lines };
}

/** `Ethan’s 2nd Arc`. 번호를 셈할 수 없으면 서수를 빼고 `Ethan’s Arc` 로 둡니다. */
function toArcTitle(name: string, arcNumber: number): string {
  return arcNumber < 1 ? `${name}\u2019s Arc` : `${name}\u2019s ${toOrdinal(arcNumber)} Arc`;
}

/**
 * 같은 고객이 남긴 지난 방문 중 Arc 가 딸린 것 — 최근 방문이 앞에 옵니다.
 *
 * **고객을 이름으로 맞춥니다.** `VisitSummaryResponse` 에 고객 식별자가 없어 이름 말고는
 * 같은 사람인지 알 방법이 없습니다. 같은 이름의 다른 고객이 같은 매장에 있으면 섞입니다 —
 * 지난 Arc 를 내려주는 엔드포인트가 생기면 이 함수째 걷어냅니다
 * (`docs/api-integration.md` 의 "화면은 있는데 엔드포인트가 없음" 참고).
 *
 * `visitedOn` 은 `YYYY.MM.DD` 라 자리 수가 고정이고, 문자열 비교가 곧 날짜 비교입니다.
 */
export function toPreviousArcVisits(
  visits: readonly StoreVisit[] | undefined,
  current: StoreVisit | undefined
): readonly StoreVisit[] {
  if (current === undefined) {
    return [];
  }

  return (visits ?? [])
    .filter(
      (candidate) =>
        candidate.id !== current.id &&
        candidate.name === current.name &&
        candidate.arcId !== undefined
    )
    .sort((left, right) => right.visitedOn.localeCompare(left.visitedOn));
}

/**
 * 이 고객의 지난 Arc 카드들 — 최근 것이 앞에 옵니다. 고객 상세가 `Next` 로 넘겨 봅니다.
 *
 * 방문 하나가 자기 `arcId` 를 실어 오므로 방문 목록이 곧 Arc 목록입니다. 본문은 방문에
 * 실려 오지 않아 Arc 를 하나씩 따로 불러 채웁니다 — 방문 횟수만큼만 쌓여 몇 건 되지 않고,
 * `staleTime` 동안 캐시에 남아 면을 오갈 때 다시 요청되지 않습니다.
 *
 * **제목의 서수는 지금 보고 있는 방문에서 하나씩 거슬러 셉니다.** 서버가 Arc 번호를
 * 내려주지 않아(`StaffArcRevision` 에 없습니다) 카드 제목과 같은 규칙(`arcLabel`)을 씁니다 —
 * 받아 온 목록이 최신부터 끊김 없이 이어진다고 보는 것입니다.
 */
export function usePreviousArcs(current: StoreVisit | undefined) {
  const { data: visits } = useStaffVisits();

  const previous = toPreviousArcVisits(visits, current);
  // 지금 방문이 Arc 를 남겼으면 그 번호가 최신이므로 한 칸 앞에서 시작합니다.
  // 아직 안 남겼으면(Visit Memory 만 썼거나 빈 방문이면) 지난 것 중 최근이 곧 최신입니다.
  const newestNumber = Math.max(current?.arcCount ?? 1, 1) - (current?.arcId === undefined ? 0 : 1);

  const entries = previous.map((visit, index) => ({
    arcId: visit.arcId ?? '',
    title: toArcTitle(visit.name, newestNumber - index),
  }));

  return useQueries({
    queries: entries.map((entry) => ({
      queryKey: staffArcKeys.detail(entry.arcId),
      queryFn: () => api.get<StaffArcRevision>(`/api/staff/arcs/${entry.arcId}`),
    })),
    combine: (results) => ({
      cards: results.flatMap((result, index) => {
        const entry = entries[index];

        return result.data === undefined || entry === undefined
          ? []
          : [toArcCard(result.data, entry.title)];
      }),
      isPending: results.some((result) => result.isPending),
      isError: results.some((result) => result.isError),
    }),
  });
}
