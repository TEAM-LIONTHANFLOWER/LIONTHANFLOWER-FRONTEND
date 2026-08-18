/**
 * 고객 Arc 화면에 들어가는 내용.
 * 문구는 시안(2-1 ~ 2-4 Arc, 2-1 Arc - Visit Memory, 기본설정)을 옮긴 것입니다.
 *
 * 시안의 영문 소제목에는 오타가 있습니다 — `Your Prefernrce`, `Your Seemed drown to...`.
 * `@constants/visit` 의 `MEMORY_CARDS` 가 이미 `You seemed drawn to` 로 바로잡아 두었어서
 * 여기서도 같은 판단으로 맞춤법을 고쳐 적습니다. 시안도 함께 고쳐야 합니다.
 *
 * 편지 본문은 고객이 고른 언어로 보여야 해서 언어별로 담아 두었습니다.
 * 영문 소제목과 제품 이름(`A Bag`, `Black / Small`)은 시안에서 언어와 상관없이
 * 그대로 쓰는 말이라 번역하지 않습니다.
 *
 * 지금은 고정값입니다. Arc API 가 붙으면 `@hooks` 의 쿼리 훅으로 옮기고 이 파일은 지웁니다.
 * 그때 편지는 직원이 쓴 글이라, 서버가 언어별로 내려주거나 번역을 거쳐야 합니다.
 */

import type { ArcEntry, InitialSetupItem, LetterContent, LetterSection } from '@/types/arc';
import type { LocalizedText } from '@/types/i18n';

/** 시안에는 고객이 모두 `Ethan` 으로 그려져 있습니다. 자리 채우기용 이름입니다. */
const PLACE = 'MCM HAUS · SEOUL(REPUBLIC OF KOREA)';
const ISSUED_ON = '13 AUGUST 2026';

/** 언어와 상관없이 그대로 두는 줄. 제품 이름과 영문 표기가 여기 들어갑니다. */
function asIs(line: string): LocalizedText {
  return { ko: line, en: line, zh: line, ja: line, ru: line };
}

/** 두 Arc 가 같은 본문을 씁니다. 시안에 한 벌만 그려져 있어서입니다. */
const LETTER_SECTIONS: readonly LetterSection[] = [
  {
    id: 'moment',
    title: 'Your MCM Moment',
    lines: [
      {
        ko: '당신은 디자인과 실용성의 균형을 중요하게 생각하는군요.',
        en: 'You value the balance between design and practicality.',
        zh: '你看重设计与实用之间的平衡。',
        ja: 'あなたはデザインと実用性のバランスを大切にされていますね。',
        ru: 'Для вас важен баланс между дизайном и практичностью.',
      },
      asIs('Selected 👜 A Bag'),
      asIs('Black / Small'),
    ],
  },
  {
    id: 'preference',
    title: 'Your Preference',
    bulleted: true,
    lines: [
      {
        ko: '실용적인 디자인',
        en: 'Practical design',
        zh: '实用的设计',
        ja: '実用的なデザイン',
        ru: 'Практичный дизайн',
      },
      {
        ko: '차분한 컬러',
        en: 'Calm colors',
        zh: '沉静的色彩',
        ja: '落ち着いたカラー',
        ru: 'Спокойные цвета',
      },
      {
        ko: '필요한 순간에 도움받는 편안한 응대',
        en: 'Relaxed service that steps in when needed',
        zh: '需要时才出现的舒适服务',
        ja: '必要なときに寄り添う心地よい接客',
        ru: 'Ненавязчивая помощь в нужный момент',
      },
    ],
  },
  {
    id: 'remember',
    title: 'A Moment to Remember',
    lines: [
      {
        ko: '오늘 가장 오래 고민했던 건 가방의 수납공간이었습니다.',
        en: 'What you weighed the longest today was the storage space of the bag.',
        zh: '今天你考虑最久的，是这款包的收纳空间。',
        ja: '今日いちばん長く迷われたのは、バッグの収納力でした。',
        ru: 'Дольше всего сегодня вы размышляли о вместительности сумки.',
      },
    ],
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
