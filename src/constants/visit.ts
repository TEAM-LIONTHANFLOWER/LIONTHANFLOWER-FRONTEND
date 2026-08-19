/**
 * 직원 화면에서 아직 서버가 내려주지 않는 부분.
 * 값은 시안(2-1 Arc 조회 / 2-1 방문기록 조회)의 문구를 그대로 옮긴 것입니다.
 *
 * 방문 목록(`VISIT_DAYS`)은 `GET /api/staff/visits` 로 옮겨 갔습니다.
 * 여기 남은 카드 두 면은 고객 한 명의 프로필과 그날 기록을 조회하는 엔드포인트가 없어
 * 고정값 그대로입니다.
 */

import type { MemoryCardContent } from '@/types/visit';

/** 고객이 어떤 사람인지 한눈에 보여주는 프로필 면. */
export const CUSTOMER_PROFILE_CARD: MemoryCardContent = {
  page: 'arc',
  title: 'Ethan',
  lines: [
    'ETHAN',
    '기존 고객',
    'Arc 4',
    '한국어 · English',
    '직원 추천 선호',
    '현재 방문: MCM HAUS',
  ],
};

/**
 * 그날 방문에서 남은 기록 면.
 *
 * 마지막 줄의 `(우리 서비스 슬로건)` 은 시안에 그렇게 적혀 있는 자리 표시입니다.
 * 슬로건이 정해지면 그 문장으로 바꿉니다.
 */
export const VISIT_RECORD_CARD: MemoryCardContent = {
  page: 'memory',
  title: 'Ethan’s Second Arc',
  lines: [
    'MCM HAUS · SEOUL(REPUBLIC OF KOREA)',
    '2026.08.13',
    'YOUR MCM MOMENT',
    'Today, you discovered',
    '👜 A Bag',
    '👜 B Bag',
    'You seemed drawn to',
    '실용적인 디자인과 차분한 컬러',
    'Worth remembering',
    '오늘 가장 관심 있게 살펴본 제품은 A Bag 이었습니다.',
    '(우리 서비스 슬로건)',
  ],
};

/** Visit Memory 카드 뷰어가 좌우로 넘겨 보여주는 두 면. */
export const MEMORY_CARDS: readonly MemoryCardContent[] = [
  CUSTOMER_PROFILE_CARD,
  VISIT_RECORD_CARD,
] as const;
