/**
 * 고객 Arc 화면에서 아직 서버가 내려주지 않는 부분.
 * 문구는 시안(2-1 Arc - Visit Memory, 기본설정)을 옮긴 것입니다.
 *
 * 봉투와 편지(`ARC_ENTRIES`)는 `GET /api/customers/arcs` 로,
 * 기본설정 팝업은 방문 세션(`@stores/visit-store`)으로 옮겨 갔습니다.
 * 고객이 받는 `Visit Memory` 도 알림 → 상세 두 번으로 읽어 옵니다(`useCustomerVisitMemory()`).
 *
 * 여기 남은 것은 **직원 화면이 쓰는 자리 채우기 한 벌** 입니다. 직원은 방문에 딸린
 * Visit Memory 의 식별자를 알아낼 방법이 없어(`docs/api-integration.md` 의 "막힌 것" 2-2)
 * 아직 서버에서 읽어 오지 못합니다.
 *
 * 시안의 영문 소제목에는 오타가 있습니다 — `Your Prefernrce`, `Your Seemed drown to...`.
 * `@constants/visit` 의 `MEMORY_CARDS` 가 이미 `You seemed drawn to` 로 바로잡아 두었어서
 * 여기서도 같은 판단으로 맞춤법을 고쳐 적습니다. 시안도 함께 고쳐야 합니다.
 *
 * 본문은 고객이 고른 언어로 보여야 해서 언어별로 담아 두었습니다.
 * 영문 소제목과 제품 이름(`A Bag`, `Black / Small`)은 시안에서 언어와 상관없이
 * 그대로 쓰는 말이라 번역하지 않습니다.
 */

import type { LetterContent } from '@/types/arc';
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
