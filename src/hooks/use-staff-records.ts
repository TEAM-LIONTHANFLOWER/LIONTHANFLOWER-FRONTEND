import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  INTEREST_POINTS,
  MEMORY_FIELD_IDS,
  NO_PURCHASE_ETC,
  NO_PURCHASE_REASONS,
  NO_PURCHASE_SITUATIONS,
  PRODUCT_ENGAGEMENTS,
  toOtherFieldId,
} from '@constants/record-form';
import { staffVisitKeys } from '@hooks/use-staff-visits';
import { api } from '@services/api';
import { readChoices, readProducts } from '@stores/record-form-store';
import type { RecordFormValues } from '@/types/record-form';
import type { ProductEngagement, StaffVisitMemory, VisitMemoryInputSnapshot } from '@/types/staff';

export const staffRecordKeys = {
  all: ['staff-records'] as const,
  visitMemory: (visitMemoryId: string) =>
    [...staffRecordKeys.all, 'visit-memory', visitMemoryId] as const,
};

/** 비어 있는 글은 보내지 않습니다. 서버에서 `적지 않음` 과 `빈 글` 이 갈립니다. */
function readNote(values: RecordFormValues, fieldId: string): string | undefined {
  const note = (values.texts[fieldId] ?? '').trim();
  return note.length === 0 ? undefined : note;
}

/**
 * 담아 둔 제품 줄 → `제품 식별자 → 반응` 표.
 *
 * 제품 검색 API 가 없어 줄마다 `variantId` 가 비어 있습니다. 식별자가 없는 줄은 서버가
 * 가리킬 대상이 없어 빼고 보냅니다 — 그래서 지금은 늘 빈 표가 나갑니다. 서버가 빈 표를
 * 받아 주기 때문에 Visit Memory 는 제품 없이도 만들어집니다.
 * (`docs/api-integration.md` 의 "막힌 것" 2 참고)
 */
function toProductEngagements(
  values: RecordFormValues
): Record<string, readonly ProductEngagement[]> {
  const engagements: Record<string, readonly ProductEngagement[]> = {};

  for (const product of readProducts(values, MEMORY_FIELD_IDS.products)) {
    if (product.variantId === undefined) {
      continue;
    }

    engagements[product.variantId] = PRODUCT_ENGAGEMENTS.select(product.reactions);
  }

  return engagements;
}

/**
 * 직원이 폼에 적은 값 한 벌 → Visit Memory 생성 요청 바디.
 *
 * 미구매 사유는 시안이 세 묶음으로 나눠 물어서, 서버가 받는 배열 하나로 이어 붙입니다.
 * `기타` 를 고른 묶음의 자유 입력은 짝이 되는 `*Other` 필드로 갑니다.
 */
export function toVisitMemorySnapshot(values: RecordFormValues): VisitMemoryInputSnapshot {
  return {
    productEngagements: toProductEngagements(values),
    interestPoints: INTEREST_POINTS.select(readChoices(values, MEMORY_FIELD_IDS.interestPoints)),
    interestPointOther: readNote(values, toOtherFieldId(MEMORY_FIELD_IDS.interestPoints)),
    noPurchaseReasons: [
      ...NO_PURCHASE_REASONS.select(readChoices(values, MEMORY_FIELD_IDS.reason)),
      ...NO_PURCHASE_SITUATIONS.select(readChoices(values, MEMORY_FIELD_IDS.situation)),
      ...NO_PURCHASE_ETC.select(readChoices(values, MEMORY_FIELD_IDS.etc)),
    ],
    noPurchaseReasonOther: readNote(values, toOtherFieldId(MEMORY_FIELD_IDS.etc)),
    nextVisitMemo: readNote(values, MEMORY_FIELD_IDS.note),
  };
}

/**
 * 직원이 쓴 Visit Memory 미리보기.
 *
 * 생성 응답과 같은 모양이라 완료 화면이 이걸로 방금 만든 글을 다시 읽습니다.
 * 화면을 새로 열어도(작성 화면에서 `수정` 으로 오갔더라도) 서버에 있는 것을 그대로 봅니다.
 */
export function useStaffVisitMemory(visitMemoryId: string | null) {
  return useQuery({
    queryKey: staffRecordKeys.visitMemory(visitMemoryId ?? ''),
    queryFn: () => api.get<StaffVisitMemory>(`/api/staff/visit-memories/${visitMemoryId}`),
    enabled: visitMemoryId !== null,
  });
}

interface CreateVisitMemoryInput {
  visitId: string;
  values: RecordFormValues;
}

/**
 * 방문 하나를 Visit Memory 로 만듭니다. 서버가 입력을 받아 글까지 써서 돌려줍니다.
 *
 * 아직 고객에게 가지 않습니다 — 직원이 미리 보고 `전송` 을 눌러야 그때 갑니다.
 */
export function useCreateVisitMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitId, values }: CreateVisitMemoryInput) =>
      api.post<StaffVisitMemory>(`/api/staff/visits/${visitId}/visit-memories`, {
        body: { inputSnapshot: toVisitMemorySnapshot(values) },
      }),
    onSuccess: (memory) => {
      // 방금 받은 것을 캐시에 심어 두면 완료 화면이 다시 묻지 않고 바로 그립니다.
      queryClient.setQueryData(staffRecordKeys.visitMemory(memory.visitMemoryId), memory);
    },
  });
}

interface RegenerateVisitMemoryInput {
  visitMemoryId: string;
  values: RecordFormValues;
}

/** 같은 입력으로 글만 다시 씁니다. 완료 화면의 `다시 생성하기` 가 부릅니다. */
export function useRegenerateVisitMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitMemoryId, values }: RegenerateVisitMemoryInput) =>
      api.post<StaffVisitMemory>(`/api/staff/visit-memories/${visitMemoryId}/regenerations`, {
        body: { inputSnapshot: toVisitMemorySnapshot(values) },
      }),
    onSuccess: (memory) => {
      queryClient.setQueryData(staffRecordKeys.visitMemory(memory.visitMemoryId), memory);
    },
  });
}

/**
 * 다 쓴 Visit Memory 를 고객에게 보냅니다.
 *
 * 보내면 상태가 `FINALIZED` 가 되고 고객 쪽에 알림이 하나 생깁니다 —
 * 고객은 그 알림의 `resourceId` 로 본문을 엽니다(`useCustomerVisitMemory()`).
 */
export function useShareVisitMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visitMemoryId: string) =>
      api.post<StaffVisitMemory>(`/api/staff/visit-memories/${visitMemoryId}/share`),
    onSuccess: (memory) => {
      queryClient.setQueryData(staffRecordKeys.visitMemory(memory.visitMemoryId), memory);
      // 보내고 나면 방문 상태가 달라져 직원 홈의 카드도 바뀝니다.
      queryClient.invalidateQueries({ queryKey: staffVisitKeys.current() });
    },
  });
}
