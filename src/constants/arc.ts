/**
 * 고객 Arc 화면에 들어가는 내용.
 * 문구는 시안(2-1 ~ 2-4 Arc, 2-1 Arc - Visit Memory, 기본설정)을 옮긴 것입니다.
 *
 * 시안의 영문 소제목에는 오타가 있습니다 — `Your Prefernrce`, `Your Seemed drown to...`.
 * `@constants/visit` 의 `MEMORY_CARDS` 가 이미 `You seemed drawn to` 로 바로잡아 두었어서
 * 여기서도 같은 판단으로 맞춤법을 고쳐 적습니다. 시안도 함께 고쳐야 합니다.
 *
 * 지금은 고정값입니다. Arc API 가 붙으면 `@hooks` 의 쿼리 훅으로 옮기고 이 파일은 지웁니다.
 */

import type { ArcEntry, InitialSetupItem, LetterContent, LetterSection } from '@/types/arc';

/** 시안에는 고객이 모두 `Ethan` 으로 그려져 있습니다. 자리 채우기용 이름입니다. */
const PLACE = 'MCM HAUS · SEOUL(REPUBLIC OF KOREA)';
const ISSUED_ON = '13 AUGUST 2026';

/** 두 Arc 가 같은 본문을 씁니다. 시안에 한 벌만 그려져 있어서입니다. */
const LETTER_SECTIONS: readonly LetterSection[] = [
  {
    id: 'moment',
    title: 'Your MCM Moment',
    lines: [
      '당신은 디자인과 실용성의 균형을 중요하게 생각하는군요.',
      'Selected 👜 A Bag',
      'Black / Small',
    ],
  },
  {
    id: 'preference',
    title: 'Your Preference',
    bulleted: true,
    lines: ['실용적인 디자인', '차분한 컬러', '필요한 순간에 도움받는 편안한 응대'],
  },
  {
    id: 'remember',
    title: 'A Moment to Remember',
    lines: ['오늘 가장 오래 고민했던 건 가방의 수납공간이었습니다.'],
  },
] as const;

export const ARC_ENTRIES: readonly ArcEntry[] = [
  {
    id: 'arc-1',
    envelopeTitle: 'Your 1st Arc',
    store: 'MCM Haus',
    date: '2026.08.12',
    letter: {
      title: 'Ethan’s 1st Arc',
      place: PLACE,
      issuedOn: ISSUED_ON,
      sections: LETTER_SECTIONS,
    },
  },
  {
    id: 'arc-2',
    envelopeTitle: 'Your 2nd Arc',
    store: 'MCM Haus',
    date: '2026.08.12',
    letter: {
      title: 'Ethan’s 2nd Arc',
      place: PLACE,
      issuedOn: ISSUED_ON,
      sections: LETTER_SECTIONS,
    },
  },
] as const;

/**
 * `Visit Memory` 를 누르면 열리는 팝업의 내용.
 * Arc 편지와 같은 편지지에 올라가지만, 아직 Arc 로 봉해지기 전의 그날 기록입니다.
 */
export const VISIT_MEMORY_LETTER: LetterContent = {
  title: 'Ethan’s Visit Memory',
  place: PLACE,
  issuedOn: ISSUED_ON,
  sections: [
    {
      id: 'moment',
      title: 'Your MCM Moment',
      lines: ['Today, you discovered', '👜 A Bag', '👜 B Bag'],
    },
    {
      id: 'drawn-to',
      title: 'You seemed drawn to',
      lines: ['실용적인 디자인과 차분한 컬러'],
    },
    {
      id: 'worth-remembering',
      title: 'Worth remembering',
      lines: ['오늘 가장 관심 있게 살펴본 제품은 A Bag이었습니다.'],
    },
  ],
};

/** `Initial setup` 을 누르면 열리는 팝업에 걸리는 항목. */
export const INITIAL_SETUP_ITEMS: readonly InitialSetupItem[] = [
  {
    id: 'service',
    label: 'Service',
    value: '혼자 둘러보는 것을 선호합니다',
    valueToken: 'bodyKo13',
  },
  {
    id: 'language',
    label: 'Language',
    value: '한국어 · English',
    valueToken: 'bodyKo14',
  },
] as const;

/** Arc 가 하나도 없을 때 카드 자리에 대신 놓는 안내. */
export const ARC_EMPTY_MESSAGE = '당신의 하나뿐인 이야기가 담긴 Arc는\nOrbit에 기록됩니다.';
