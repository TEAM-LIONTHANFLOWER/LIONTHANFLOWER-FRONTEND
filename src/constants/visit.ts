/**
 * 직원 화면 데모 데이터.
 * 값은 시안(1-1 Home / 2-1 Arc 조회 / 2-1 방문기록 조회)의 문구를 그대로 옮긴 것입니다.
 *
 * 매장 방문 목록은 원래 서버에서 오는 값입니다. 아직 API 가 없어 고정값으로 두었고,
 * 엔드포인트가 생기면 `@hooks` 의 쿼리 훅으로 옮기고 이 파일은 지웁니다.
 */

import type { MemoryCardContent, VisitDay } from '@/types/visit';

/**
 * 시안에는 고객이 모두 `Ethan` 으로 그려져 있습니다.
 * 자리 채우기용 이름이라 그대로 두되, 식별자만 카드마다 다르게 두었습니다.
 */
export const VISIT_DAYS: readonly VisitDay[] = [
  {
    date: '2026.08.12',
    visits: [
      {
        id: 'visit-with-1',
        name: 'Ethan',
        languages: ['한국어', 'English'],
        arcLabel: '1st Arc',
        request: '다양한 컬러를 보고싶어요',
        mode: 'with',
        status: 'in-progress',
        startedAt: '08:24',
      },
      {
        id: 'visit-with-2',
        name: 'Ethan',
        languages: ['한국어', 'English'],
        arcLabel: '2nd Arc',
        request: '다양한 컬러를 보고싶어요',
        mode: 'with',
        status: 'waiting',
      },
      {
        id: 'visit-with-3',
        name: 'Ethan',
        languages: ['한국어', 'English'],
        arcLabel: '1st Arc',
        request: '다양한 컬러를 보고싶어요',
        mode: 'with',
        status: 'done',
      },
      {
        id: 'visit-solo-1',
        name: 'Ethan',
        languages: ['한국어', 'English'],
        arcLabel: '1st Arc',
        request: '다양한 컬러를 보고싶어요',
        mode: 'solo',
        status: 'in-progress',
      },
      {
        id: 'visit-solo-2',
        name: 'Ethan',
        languages: ['한국어', 'English'],
        arcLabel: '2nd Arc',
        request: '다양한 컬러를 보고싶어요',
        mode: 'solo',
        status: 'done',
      },
      {
        id: 'visit-solo-3',
        name: 'Ethan',
        languages: ['한국어', 'English'],
        arcLabel: '1st Arc',
        request: '다양한 컬러를 보고싶어요',
        mode: 'solo',
        status: 'done',
      },
    ],
    arcs: [],
  },
  {
    date: '2026.08.11',
    visits: [],
    arcs: [
      { id: 'arc-1', title: 'Ethan’s 1st Arc', store: 'MCM Haus', date: '2026.08.11' },
      { id: 'arc-2', title: 'Ethan’s 1st Arc', store: 'MCM Haus', date: '2026.08.11' },
    ],
  },
] as const;

/**
 * Visit Memory 카드 뷰어가 좌우로 넘겨 보여주는 두 면.
 *
 * 마지막 줄의 `(우리 서비스 슬로건)` 은 시안에 그렇게 적혀 있는 자리 표시입니다.
 * 슬로건이 정해지면 그 문장으로 바꿉니다.
 */
export const MEMORY_CARDS: readonly MemoryCardContent[] = [
  {
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
  },
  {
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
  },
] as const;
