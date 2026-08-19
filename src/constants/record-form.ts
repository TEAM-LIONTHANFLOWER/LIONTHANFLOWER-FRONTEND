/**
 * 직원용 기록 작성 폼의 단계와 보기 목록.
 * 문구는 시안(2-1 구매하는 경우 / 2-2 구매하지 않는 경우)을 옮긴 것입니다.
 *
 * 시안의 오타와 자리 표시는 아래처럼 바로잡아 적었습니다. 시안도 함께 고쳐야 합니다.
 * - `구매 제품` 필드의 플레이스홀더가 로그인 화면에서 넘어온 `Please enter your name.` 이라
 *   같은 성격의 다른 필드처럼 `제품을 검색하여 입력해주세요` 로 적습니다.
 * - 선호 컬러의 `Metalic` → `Metallic`
 *
 * **보기의 `value` 는 서버 enum 값입니다.** 화면에는 `label` 이 보이고, 스토어에 담겨
 * 요청 바디로 나가는 것은 `value` 입니다. 목록의 개수와 순서가 서버 enum 과 그대로 맞아
 * 라벨을 코드로 옮기는 대응표를 따로 두지 않았습니다 — 보기 자체가 대응표입니다.
 *
 * 시안에 없지만 서버 enum 에 있어 더한 것이 둘 있습니다. **디자인 확인이 필요합니다.**
 * - 선호 컬러의 `Other` — 다른 묶음에는 모두 `기타` 가 있는데 컬러만 빠져 있었습니다.
 * - `기타` 를 고르면 열리는 자유 입력 한 줄 — 서버가 `preferredColorOther` 처럼
 *   묶음마다 짝이 되는 필드를 받는데, 적을 자리가 없었습니다.
 */

import { CUSTOMER_PROFILE_CARD, VISIT_RECORD_CARD } from '@constants/visit';
import type { RecordFlow, RecordOption, RecordStep } from '@/types/record-form';
import type { InterestPoint, NoPurchaseReason, ProductEngagement } from '@/types/staff';
import type { MemoryCardContent } from '@/types/visit';

/** `기타` 보기의 서버 값. 다섯 묶음이 같은 값을 씁니다. */
const OTHER = 'OTHER';
const OTHER_PLACEHOLDER = '직접 입력해주세요';

/**
 * `기타` 자유 입력이 담기는 열쇠.
 * 입력칸을 그리는 쪽과 요청 바디를 만드는 쪽이 같은 이름을 쓰도록 한곳에 둡니다.
 */
export function toOtherFieldId(sectionId: string): string {
  return `${sectionId}-other`;
}

/**
 * `[서버 값, 화면 라벨]` 짝을 보기로 폅니다.
 *
 * 타입 인자로 서버 enum 을 넘기면 **값이 실제 enum 에 있는지 컴파일 때 검사됩니다.**
 * 서버가 enum 을 고치면 `@/types/staff` 만 맞춰 두어도 여기서 어긋난 자리가 드러납니다.
 * Arc 쪽 목록은 아직 요청 타입이 없어(생성이 막혀 있습니다) 검사 없이 둡니다.
 */
function toOptions<T extends string = string>(
  pairs: readonly (readonly [T, string])[]
): readonly RecordOption[] {
  return pairs.map(([value, label]) => ({ value, label }));
}

/**
 * 화면에 그릴 보기와, 담긴 값을 서버 enum 으로 골라 내는 일을 함께 들고 있는 묶음.
 *
 * 폼 스토어는 값을 문자열로 담습니다. 그걸 요청에 실으려면 서버 enum 이라는 것을 알아야
 * 하는데, 보기를 만든 자리가 곧 그 사실을 아는 자리라 여기서 함께 내어 줍니다.
 * 덕분에 enum 값을 요청 만드는 쪽에 한 벌 더 적어 둘 필요가 없습니다.
 */
export interface RecordChoiceGroup<T extends string> {
  options: readonly RecordOption[];
  /**
   * 담긴 값 중 이 묶음의 보기에 있는 것만 골라 냅니다.
   * 돌아오는 차례는 고른 차례가 아니라 보기에 적힌 차례입니다 — 서버 enum 순서와 같습니다.
   */
  select: (values: readonly string[]) => readonly T[];
}

function toChoiceGroup<T extends string>(
  pairs: readonly (readonly [T, string])[]
): RecordChoiceGroup<T> {
  const values = pairs.map(([value]) => value);

  return {
    options: toOptions(pairs),
    select: (chosen) => values.filter((value) => chosen.includes(value)),
  };
}

/**
 * 선호 컬러 보기. 라벨 왼쪽에 색 동그라미가 함께 붙습니다.
 *
 * 동그라미 색은 UI 토큰이 아니라 보기가 가리키는 제품 컬러 값 자체입니다.
 * 다크 모드에 따라 뒤집히면 뜻이 달라지므로 `@constants/theme` 이 아니라 여기에 적습니다.
 * `Metallic` 과 `Multicolor` 만 한 색으로 나타낼 수 없어 그러데이션으로 둡니다.
 * `Other` 는 가리키는 색이 없어 동그라미를 달지 않습니다.
 */
const COLOR_OPTIONS: readonly RecordOption[] = [
  { value: 'BLACK', label: 'Black', swatch: '#000000' },
  { value: 'WHITE', label: 'White', swatch: '#ffffff' },
  { value: 'BROWN_BEIGE', label: 'Brown / Beige', swatch: '#6e4426' },
  { value: 'GRAY', label: 'Grey', swatch: '#6b6b6b' },
  { value: 'NAVY_BLUE', label: 'Navy / Blue', swatch: '#123d84' },
  { value: 'RED', label: 'Red', swatch: '#b00c0c' },
  { value: 'PINK', label: 'Pink', swatch: '#f669e8' },
  { value: 'GREEN', label: 'Green', swatch: '#34a853' },
  { value: 'YELLOW', label: 'Yellow', swatch: '#ffca1a' },
  { value: 'METALLIC', label: 'Metallic', swatch: ['#ffffff', '#4c4c4c'] },
  {
    value: 'MULTI_COLOR',
    label: 'Multicolor',
    swatch: ['#c92323', '#ff8031', '#f5d02d', '#39ca54', '#142ad2'],
  },
  { value: OTHER, label: 'Other' },
] as const;

/* Visit Memory 요청에 그대로 실리는 묶음들. 요청을 만드는 쪽(`@hooks/use-staff-records`)이
 * 값 목록을 다시 적지 않도록 보기와 고르는 방법을 함께 내어 줍니다. */

/** 제품 하나에 고객이 보인 반응. */
export const PRODUCT_ENGAGEMENTS = toChoiceGroup<ProductEngagement>([
  ['VIEWED_WITH_INTEREST', '관심있게 살펴봄'],
  ['COMPARED', '다른 제품과 비교함'],
  ['TRIED_OR_INSPECTED', '착용/실물 확인함'],
  ['ASKED_STAFF', '직원에게 질문함'],
  ['VIEWED_LONG', '오래 살펴봄'],
  ['CONSIDERED_PURCHASE', '구매를 고민함'],
]);

/** 고객이 무엇을 눈여겨봤는지. */
export const INTEREST_POINTS = toChoiceGroup<InterestPoint>([
  ['DESIGN', '디자인'],
  ['COLOR', '컬러'],
  ['MATERIAL_QUALITY', '소재 / 품질'],
  ['PRACTICALITY', '실용성'],
  ['STORAGE_FUNCTIONALITY', '수납 / 기능성'],
  ['SIZE', '사이즈'],
  ['BRAND_IDENTITY', '브랜드 아이덴티티'],
  ['PRICE', '가격'],
  ['RARITY_LIMITED', '희소성'],
  ['GIFT_SUITABILITY', '선물 적합성'],
  ['TRAVEL_DAILY_USE', '일상 활용성'],
  [OTHER, '기타'],
]);

/**
 * 구매하지 않은 이유. 서버는 배열 하나로 받는데 시안이 셋으로 나눠 물어서
 * 묶음도 셋으로 두고, 요청을 만들 때 이 차례로 이어 붙입니다.
 */
export const NO_PURCHASE_REASONS = toChoiceGroup<NoPurchaseReason>([
  ['CONSIDERING_PURCHASE', '구매를 고민중'],
  ['NEED_COMPARE', '다른 제품과 비교 필요'],
  ['NEED_MORE_TIME', '구매 결정까지 시간이 더 필요'],
  ['CONSIDER_PRICE', '가격을 더 고려해야함'],
  ['DESIRED_PRODUCT_OR_COLOR_NOT_FOUND', '원하는 제품/컬러를 찾지 못함'],
]);

export const NO_PURCHASE_SITUATIONS = toChoiceGroup<NoPurchaseReason>([
  ['TRAVEL_SCHEDULE', '여행 일정상 구매 보류'],
  ['INSUFFICIENT_TIME', '시간 부족'],
  ['CONSULT_COMPANION', '동행인과 상의 필요'],
  ['CONSULT_GIFT_RECIPIENT', '선물 대상과 상의 필요'],
  ['BUDGET', '예산 문제'],
  ['PLAN_REVISIT', '재방문 예정'],
]);

export const NO_PURCHASE_ETC = toChoiceGroup<NoPurchaseReason>([
  ['BROWSING_ONLY', '특별한 구매 의사 없이 둘러봄'],
  [OTHER, '기타'],
]);

/**
 * Arc 의 구매정보 칸을 가리키는 열쇠.
 * 매장을 고를 때 국가 칸을 함께 채워야 해서 서로의 `id` 를 알아야 합니다.
 */
export const ARC_FIELD_IDS = {
  purchaseDate: 'purchase-date',
  purchaseCountry: 'purchase-country',
  purchaseStore: 'purchase-store',
} as const;

/**
 * Visit Memory 요청을 만들 때 값을 꺼내는 열쇠.
 * 아래 단계 정의가 이 값을 그대로 쓰므로 폼과 요청이 어긋날 수 없습니다.
 */
export const MEMORY_FIELD_IDS = {
  products: 'interest-products',
  interestPoints: 'interest-points',
  reason: 'no-purchase-reason',
  situation: 'no-purchase-situation',
  etc: 'no-purchase-etc',
  note: 'staff-note',
} as const;

const NOTE_PLACEHOLDER = '텍스트를 입력해주세요 (200자)';
const NOTE_MAX_LENGTH = 200;
const PRODUCT_PLACEHOLDER = '제품을 검색하여 입력해주세요';

/** 구매한 고객의 Arc 를 작성하는 네 단계. */
const ARC_STEPS: readonly RecordStep[] = [
  {
    id: 'purchase',
    label: '구매정보',
    sections: [
      {
        // 서버가 `YYYY-MM-DD` 만 받습니다. 점으로 적어 보내면 400 이라 달력에서 고르게 합니다.
        kind: 'date',
        id: ARC_FIELD_IDS.purchaseDate,
        label: '구매 날짜',
        placeholder: '날짜를 선택해주세요',
        required: true,
      },
      {
        // 매장을 고르면 이 칸도 그 매장의 국가로 함께 채워집니다.
        kind: 'country',
        id: ARC_FIELD_IDS.purchaseCountry,
        label: '구매 국가',
        placeholder: '국가를 선택해주세요',
        required: true,
      },
      {
        kind: 'store',
        id: ARC_FIELD_IDS.purchaseStore,
        label: '구매 매장',
        placeholder: '매장을 검색하여 입력해주세요',
        required: true,
        countryFieldId: ARC_FIELD_IDS.purchaseCountry,
      },
      {
        kind: 'products',
        id: 'purchase-products',
        label: '구매 제품',
        placeholder: PRODUCT_PLACEHOLDER,
        required: true,
      },
    ],
  },
  {
    id: 'preference',
    label: '고객선호',
    sections: [
      {
        // 서버가 세 가지 중에서만 받아서(`BAG` `CLOTHING` `ACCESSORY`) 칩으로 고릅니다.
        // 자유 입력이던 때에는 무엇을 적어도 보낼 수 없는 값이었습니다.
        kind: 'chips',
        id: 'preferred-category',
        label: '이번 방문에서의 선호 제품군',
        multiple: true,
        options: toOptions([
          ['BAG', '가방'],
          ['CLOTHING', '의류'],
          ['ACCESSORY', '액세서리'],
        ]),
      },
      {
        kind: 'chips',
        id: 'preferred-color',
        label: '이번 방문에서의 선호 컬러',
        multiple: true,
        options: COLOR_OPTIONS,
        otherValue: OTHER,
        otherPlaceholder: OTHER_PLACEHOLDER,
      },
      {
        kind: 'chips',
        id: 'preferred-style',
        label: '이번 방문에서의 선호 스타일',
        multiple: true,
        options: toOptions([
          ['CLASSIC_TIMELESS', '클래식'],
          ['MINIMAL_SIMPLE', '미니멀 / 심플'],
          ['LOGO_FORWARD', '로고 스타일'],
          ['PATTERN_GRAPHIC', '패턴 / 그래픽'],
          ['DISTINCTIVE', '개성'],
          ['CASUAL', '캐주얼'],
          ['FORMAL_REFINED', '세련됨'],
          ['TRENDY', '트렌디'],
          ['PRACTICAL', '실용적'],
          [OTHER, '기타'],
        ]),
        otherValue: OTHER,
        otherPlaceholder: OTHER_PLACEHOLDER,
      },
      {
        // 서버가 제품 식별자 목록으로 받아서 `구매 제품` 과 같은 묶음으로 그립니다.
        // 한 줄짜리 자유 입력이던 때에는 고른 제품을 가리킬 수 없었습니다.
        kind: 'products',
        id: 'interested-products',
        label: '이번 방문에서의 관심 제품',
        placeholder: PRODUCT_PLACEHOLDER,
      },
      {
        kind: 'chips',
        id: 'purchase-criteria',
        label: '이번 방문에서의 구매 기준',
        multiple: true,
        options: toOptions([
          ['DESIGN', '디자인'],
          ['PRACTICALITY', '실용성'],
          ['BRAND_IDENTITY', '브랜드 아이덴티티'],
          ['RARITY', '희소성'],
          ['PRICE', '가격'],
          ['QUALITY_MATERIAL', '품질 / 소재'],
          ['STORAGE_FUNCTIONALITY', '수납 / 기능성'],
          ['SIZE', '사이즈'],
          ['COLOR', '컬러'],
          ['GIFT_SUITABILITY', '선물 적합성'],
          ['TRAVEL_DAILY_USE', '일상 활용성'],
          [OTHER, '기타'],
        ]),
        otherValue: OTHER,
        otherPlaceholder: OTHER_PLACEHOLDER,
      },
    ],
  },
  {
    id: 'service',
    label: '응대특성',
    sections: [
      {
        kind: 'options',
        id: 'preferred-service',
        label: '실제 선호 응대 방식',
        options: toOptions([
          ['ACTIVE_RECOMMENDATION', '적극적인 추천'],
          ['MODERATE_GUIDANCE', '적당한 안내'],
          ['FREE_EXPLORATION', '자유로운 탐색'],
          ['CONTEXT_DEPENDENT', '상황에 따라'],
        ]),
      },
      {
        kind: 'options',
        id: 'explanation-preference',
        label: '제품 설명 선호',
        options: toOptions([
          ['DETAILED', '상세한 설명 선호'],
          ['KEY_POINTS_ONLY', '핵심만 설명'],
          ['ON_DEMAND', '필요할 때 설명'],
        ]),
      },
      {
        kind: 'options',
        id: 'decision-style',
        label: '구매 결정 방식',
        options: toOptions([
          ['QUICK', '빠르게 결정하는 편'],
          ['COMPARE_FIRST', '비교 후 결정하는 편'],
          ['DELIBERATE', '충분히 고민하는 편'],
          ['CONTEXT_DEPENDENT', '상황에 따라 다름'],
        ]),
      },
    ],
  },
  {
    id: 'observation',
    label: '직원관찰',
    sections: [
      {
        kind: 'note',
        id: 'staff-note',
        label: '고객 특이사항',
        description: '고객의 특이사항이나 다음 응대에 도움이 될 내용을 자유롭게 입력해주세요.',
        placeholder: NOTE_PLACEHOLDER,
        maxLength: NOTE_MAX_LENGTH,
      },
    ],
  },
] as const;

/** 구매하지 않은 고객의 Visit Memory 를 작성하는 네 단계. */
const MEMORY_STEPS: readonly RecordStep[] = [
  {
    id: 'interest',
    label: '관심제품',
    sections: [
      {
        kind: 'products',
        id: MEMORY_FIELD_IDS.products,
        label: '관심 제품',
        placeholder: PRODUCT_PLACEHOLDER,
        numbered: true,
        reactions: PRODUCT_ENGAGEMENTS.options,
      },
    ],
  },
  {
    id: 'reaction',
    label: '고객반응',
    sections: [
      {
        kind: 'chips',
        id: MEMORY_FIELD_IDS.interestPoints,
        label: '관심 포인트',
        multiple: true,
        options: INTEREST_POINTS.options,
        otherValue: OTHER,
        otherPlaceholder: OTHER_PLACEHOLDER,
      },
    ],
  },
  {
    // 서버는 미구매 사유를 배열 하나로 받습니다. 시안이 세 묶음으로 나눠 두어서
    // 화면은 그대로 두고, 보낼 때 세 묶음의 값을 이어 붙입니다.
    id: 'reason',
    label: '미구매사유',
    sections: [
      {
        kind: 'options',
        id: MEMORY_FIELD_IDS.reason,
        label: '구매하지 않은 이유',
        options: NO_PURCHASE_REASONS.options,
      },
      {
        kind: 'options',
        id: MEMORY_FIELD_IDS.situation,
        label: '구매하지 않은 상황',
        options: NO_PURCHASE_SITUATIONS.options,
      },
      {
        // 시안이 이 묶음에도 `구매하지 않은 이유` 라는 같은 라벨을 붙여 두었습니다.
        // 위 묶음과 헷갈리지 않게 시안을 고쳐야 하지만, 임의로 바꾸지 않고 그대로 옮깁니다.
        kind: 'options',
        id: MEMORY_FIELD_IDS.etc,
        label: '구매하지 않은 이유',
        options: NO_PURCHASE_ETC.options,
        otherValue: OTHER,
        otherPlaceholder: OTHER_PLACEHOLDER,
      },
    ],
  },
  {
    id: 'next-visit',
    label: '다음방문',
    sections: [
      {
        kind: 'note',
        id: MEMORY_FIELD_IDS.note,
        label: '고객 특이사항',
        description: '고객의 다음 방문에 도움이 될 내용을 자유롭게 작성해주세요.',
        placeholder: NOTE_PLACEHOLDER,
        maxLength: NOTE_MAX_LENGTH,
      },
    ],
  },
] as const;

export const RECORD_STEPS: Record<RecordFlow, readonly RecordStep[]> = {
  arc: ARC_STEPS,
  memory: MEMORY_STEPS,
};

/** 흐름마다 다른 문구. 껍데기는 같고 이 값들만 갈아 끼웁니다. */
interface RecordFlowCopy {
  /** 단계 폼과 완료 화면의 스크린 리더용 이름 */
  title: string;
  /** 완료 화면에서 작성한 내용을 다시 여는 버튼 */
  editLabel: string;
  /** 완료 화면을 마치는 버튼. Visit Memory 는 고객에게 보내고, Arc 는 고객의 최종 저장으로 넘깁니다. */
  submitLabel: string;
}

export const RECORD_FLOW_COPY: Record<RecordFlow, RecordFlowCopy> = {
  arc: { title: 'Arc 작성', editLabel: 'Arc 수정', submitLabel: '저장' },
  memory: { title: 'Visit Memory 작성', editLabel: '방문기록 수정', submitLabel: '방문기록 전송' },
};

/** 단계 폼 머리말의 안내 한 줄. 직원 홈과 같은 문구입니다. */
export const RECORD_FORM_DESCRIPTION = '오늘의 취향과 여정을 담은 브랜드 경험을 만나보세요.';

/** 완료 화면 머리말의 안내 한 줄. */
export const RECORD_COMPLETE_DESCRIPTION = '오늘의 경험이 새로운 Arc로 기록됩니다.';

/** 완료 화면 카드 안에 놓이는 버튼. */
export const RECORD_REGENERATE_LABEL = '다시 생성하기';

/**
 * 작성을 마친 뒤 보여주는 카드.
 * 시안이 Arc 는 방금 쓴 편지 본문을, Visit Memory 는 고객 프로필을 보여줍니다.
 *
 * Visit Memory 는 이제 서버가 쓴 글을 그대로 보여줍니다. Arc 는 생성 API 가 막혀 있어
 * (`docs/api-integration.md` 의 "막힌 것" 2 참고) 아직 이 데모 내용을 씁니다.
 */
export const RECORD_COMPLETE_CARDS: Record<RecordFlow, MemoryCardContent> = {
  arc: VISIT_RECORD_CARD,
  memory: CUSTOMER_PROFILE_CARD,
};
