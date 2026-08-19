/**
 * 고객 Arc 화면에서 아직 서버가 내려주지 않는 부분.
 * 문구는 시안(2-1 Arc - Visit Memory, 기본설정)을 옮긴 것입니다.
 *
 * 봉투와 편지(`ARC_ENTRIES`)는 `GET /api/customers/arcs` 로 옮겨 갔습니다.
 * 여기 남은 둘은 대응하는 엔드포인트가 없어 고정값 그대로입니다 —
 * `Visit Memory` 팝업은 알림에서 받은 `visitMemoryId` 가 있어야 조회할 수 있고,
 * 기본설정 팝업은 고객의 온보딩 입력을 되읽는 엔드포인트가 없습니다.
 *
 * 시안의 영문 소제목에는 오타가 있습니다 — `Your Prefernrce`, `Your Seemed drown to...`.
 * `@constants/visit` 의 `MEMORY_CARDS` 가 이미 `You seemed drawn to` 로 바로잡아 두었어서
 * 여기서도 같은 판단으로 맞춤법을 고쳐 적습니다. 시안도 함께 고쳐야 합니다.
 *
 * 본문은 고객이 고른 언어로 보여야 해서 언어별로 담아 두었습니다.
 * 영문 소제목과 제품 이름(`A Bag`, `Black / Small`)은 시안에서 언어와 상관없이
 * 그대로 쓰는 말이라 번역하지 않습니다.
 */

import type { InitialSetupItem, LetterContent } from '@/types/arc';
import type { LocalizedText } from '@/types/i18n';

/** 시안에는 고객이 모두 `Ethan` 으로 그려져 있습니다. 자리 채우기용 이름입니다. */
const PLACE = 'MCM HAUS · SEOUL(REPUBLIC OF KOREA)';

/** 언어와 상관없이 그대로 두는 줄. 제품 이름과 영문 표기가 여기 들어갑니다. */
function asIs(line: string): LocalizedText {
  return { ko: line, en: line, zh: line, ja: line, ru: line };
}

/**
 * `Visit Memory` 를 누르면 열리는 팝업의 내용.
 * Arc 편지와 같은 편지지에 올라가지만, 아직 Arc 로 봉해지기 전의 그날 기록입니다.
 */
export const VISIT_MEMORY_LETTER: LetterContent = {
  title: 'Ethan’s Visit Memory',
  place: PLACE,
  issuedOn: '18 AUGUST 2026',
  sections: [
    {
      id: 'moment',
      title: 'Your MCM Moment',
      lines: [asIs('Today, you discovered'), asIs('👜 A Bag'), asIs('👜 B Bag')],
    },
    {
      id: 'drawn-to',
      title: 'You seemed drawn to',
      lines: [
        {
          ko: '실용적인 디자인과 차분한 컬러',
          en: 'Practical design and calm colors',
          zh: '实用的设计与沉静的色彩',
          ja: '実用的なデザインと落ち着いたカラー',
          ru: 'Практичный дизайн и спокойные цвета',
        },
      ],
    },
    {
      id: 'worth-remembering',
      title: 'Worth remembering',
      lines: [
        {
          ko: '오늘 가장 관심 있게 살펴본 제품은 A Bag이었습니다.',
          en: 'The piece you looked at most closely today was the A Bag.',
          zh: '今天你看得最仔细的产品是 A Bag。',
          ja: '今日いちばん熱心にご覧になった商品は A Bag でした。',
          ru: 'Больше всего сегодня вас заинтересовала сумка A Bag.',
        },
      ],
    },
  ],
};

/** `Initial setup` 을 누르면 열리는 팝업에 걸리는 항목. */
export const INITIAL_SETUP_ITEMS: readonly InitialSetupItem[] = [
  {
    id: 'service',
    label: 'Service',
    value: {
      ko: '혼자 둘러보는 것을 선호합니다',
      en: 'Prefers to browse alone',
      zh: '偏好自己逛',
      ja: 'ひとりで見て回ることを好みます',
      ru: 'Предпочитает смотреть самостоятельно',
    },
    valueToken: 'bodyKo13',
  },
  {
    id: 'language',
    label: 'Language',
    // 언어 이름은 그 언어의 글자로 적는 것이 관례라 어느 언어에서 봐도 같습니다.
    value: asIs('한국어 · English'),
    valueToken: 'bodyKo14',
  },
] as const;
