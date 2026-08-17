/**
 * 직원용 기록 작성 폼의 단계와 보기 목록.
 * 문구는 시안(2-1 구매하는 경우 / 2-2 구매하지 않는 경우)을 옮긴 것입니다.
 *
 * 시안의 오타와 자리 표시는 아래처럼 바로잡아 적었습니다. 시안도 함께 고쳐야 합니다.
 * - `구매 제품` 필드의 플레이스홀더가 로그인 화면에서 넘어온 `Please enter your name.` 이라
 *   같은 성격의 다른 필드처럼 `제품을 검색하여 입력해주세요` 로 적습니다.
 * - 선호 컬러의 `Metlaic` → `Metallic`
 *
 * 보기의 `value` 로 라벨을 그대로 씁니다. 아직 서버와 맞출 코드값이 없고,
 * 한 묶음 안에서 라벨이 겹치지 않기 때문입니다. API 가 붙으면 코드값으로 바꿉니다.
 *
 * 지금은 고정값입니다. 기록 API 가 붙으면 `@hooks` 의 뮤테이션 훅으로 옮깁니다.
 */

import { CUSTOMER_PROFILE_CARD, VISIT_RECORD_CARD } from '@constants/visit';
import type { RecordFlow, RecordOption, RecordStep } from '@/types/record-form';
import type { MemoryCardContent } from '@/types/visit';

/** 라벨만 적은 목록을 보기로 폅니다. */
function toOptions(labels: readonly string[]): readonly RecordOption[] {
  return labels.map((label) => ({ value: label, label }));
}

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
        kind: 'text',
        id: 'purchase-date',
        label: '구매 날짜',
        placeholder: 'YYYY.MM.DD',
        required: true,
        icon: 'calendar',
      },
      {
        kind: 'text',
        id: 'purchase-country',
        label: '구매 국가',
        placeholder: '국가를 검색하여 입력해주세요',
        required: true,
        icon: 'search',
      },
      {
        kind: 'text',
        id: 'purchase-store',
        label: '구매 매장',
        placeholder: '매장을 검색하여 입력해주세요',
        required: true,
        icon: 'search',
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
        kind: 'text',
        id: 'preferred-category',
        label: '이번 방문에서의 선호 제품군',
        placeholder: '제품군을 검색하여 입력해주세요',
        icon: 'search',
      },
      {
        kind: 'chips',
        id: 'preferred-color',
        label: '이번 방문에서의 선호 컬러',
        multiple: true,
        options: toOptions([
          'Black',
          'White',
          'Brown / Beige',
          'Grey',
          'Navy / Blue',
          'Red',
          'Pink',
          'Green',
          'Yellow',
          'Metallic',
          'Multicolor',
        ]),
      },
      {
        kind: 'chips',
        id: 'preferred-style',
        label: '이번 방문에서의 선호 스타일',
        multiple: true,
        options: toOptions([
          '클래식',
          '미니멀 / 심플',
          '로고 스타일',
          '패턴 / 그래픽',
          '개성',
          '캐주얼',
          '세련됨',
          '트렌디',
          '실용적',
          '기타',
        ]),
      },
      {
        kind: 'text',
        id: 'interested-product',
        label: '이번 방문에서의 관심 제품',
        placeholder: PRODUCT_PLACEHOLDER,
        icon: 'search',
      },
      {
        kind: 'chips',
        id: 'purchase-criteria',
        label: '이번 방문에서의 구매 기준',
        multiple: true,
        options: toOptions([
          '디자인',
          '실용성',
          '브랜드 아이덴티티',
          '희소성',
          '가격',
          '품질 / 소재',
          '수납 / 기능성',
          '사이즈',
          '컬러',
          '선물 적합성',
          '일상 활용성',
          '기타',
        ]),
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
        options: toOptions(['적극적인 추천', '적당한 안내', '자유로운 탐색', '상황에 따라']),
      },
      {
        kind: 'options',
        id: 'explanation-preference',
        label: '제품 설명 선호',
        options: toOptions(['상세한 설명 선호', '핵심만 설명', '필요할 때 설명']),
      },
      {
        kind: 'options',
        id: 'decision-style',
        label: '구매 결정 방식',
        options: toOptions([
          '빠르게 결정하는 편',
          '비교 후 결정하는 편',
          '충분히 고민하는 편',
          '상황에 따라 다름',
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
        id: 'interest-products',
        label: '관심 제품',
        placeholder: PRODUCT_PLACEHOLDER,
        numbered: true,
        reactions: toOptions([
          '관심있게 살펴봄',
          '다른 제품과 비교함',
          '착용/실물 확인함',
          '직원에게 질문함',
          '오래 살펴봄',
          '구매를 고민함',
        ]),
      },
    ],
  },
  {
    id: 'reaction',
    label: '고객반응',
    sections: [
      {
        kind: 'chips',
        id: 'interest-points',
        label: '관심 포인트',
        multiple: true,
        options: toOptions([
          '디자인',
          '컬러',
          '소재 / 품질',
          '실용성',
          '수납 / 기능성',
          '사이즈',
          '브랜드 아이덴티티',
          '가격',
          '희소성',
          '선물 적합성',
          '일상 활용성',
          '기타',
        ]),
      },
    ],
  },
  {
    id: 'reason',
    label: '미구매사유',
    sections: [
      {
        kind: 'options',
        id: 'no-purchase-reason',
        label: '구매하지 않은 이유',
        options: toOptions([
          '구매를 고민중',
          '다른 제품과 비교 필요',
          '구매 결정까지 시간이 더 필요',
          '가격을 더 고려해야함',
          '원하는 제품/컬러를 찾지 못함',
        ]),
      },
      {
        kind: 'options',
        id: 'no-purchase-situation',
        label: '구매하지 않은 상황',
        options: toOptions([
          '여행 일정상 구매 보류',
          '시간 부족',
          '동행인과 상의 필요',
          '선물 대상과 상의 필요',
          '예산 문제',
          '재방문 예정',
        ]),
      },
      {
        // 시안이 이 묶음에도 `구매하지 않은 이유` 라는 같은 라벨을 붙여 두었습니다.
        // 위 묶음과 헷갈리지 않게 시안을 고쳐야 하지만, 임의로 바꾸지 않고 그대로 옮깁니다.
        kind: 'options',
        id: 'no-purchase-etc',
        label: '구매하지 않은 이유',
        options: toOptions(['특별한 구매 의사 없이 둘러봄', '기타']),
      },
    ],
  },
  {
    id: 'next-visit',
    label: '다음방문',
    sections: [
      {
        kind: 'note',
        id: 'staff-note',
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
  /** 완료 화면에서 고객에게 보내는 버튼 */
  submitLabel: string;
}

export const RECORD_FLOW_COPY: Record<RecordFlow, RecordFlowCopy> = {
  arc: { title: 'Arc 작성', editLabel: 'Arc 수정', submitLabel: 'Arc 전송' },
  memory: { title: 'Visit Memory 작성', editLabel: '방문기록 수정', submitLabel: '방문기록 전송' },
};

/** 단계 폼 머리말의 안내 한 줄. 직원 홈과 같은 문구입니다. */
export const RECORD_FORM_DESCRIPTION = '오늘의 취향과 여정을 담은 브랜드 경험을 만나보세요.';

/** 완료 화면 머리말의 안내 한 줄. */
export const RECORD_COMPLETE_DESCRIPTION = '오늘의 경험이 새로운 Arc로 기록됩니다.';

/** 완료 화면 카드 안에 놓이는 버튼. 생성 API 가 없어 아직 눌리지 않습니다. */
export const RECORD_REGENERATE_LABEL = '다시 생성하기';

/**
 * 작성을 마친 뒤 보여주는 카드.
 * 시안이 Arc 는 방금 쓴 편지 본문을, Visit Memory 는 고객 프로필을 보여줍니다.
 *
 * 아직 작성한 값으로 본문을 만들어 주는 API 가 없어, 고객 상세 화면과 같은 데모 내용을 씁니다.
 */
export const RECORD_COMPLETE_CARDS: Record<RecordFlow, MemoryCardContent> = {
  arc: VISIT_RECORD_CARD,
  memory: CUSTOMER_PROFILE_CARD,
};
