/**
 * 고객 Arc 화면에서 아직 서버가 내려주지 않는 부분 + 편지 뒷면 도시 그림을 고르는 데 쓰는 상수.
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

import type { ImageRequireSource } from 'react-native';

import letterMunich from '@assets/images/arc/letter-munich.png';
import letterParis from '@assets/images/arc/letter-paris.png';
import letterSeoul from '@assets/images/arc/letter-seoul.png';
import type { LetterContent } from '@/types/arc';
import type { LocalizedText } from '@/types/i18n';

/** 편지 뒷면(`ArcLetterBack`)의 캡션·도시 그림 한 벌. */
interface LetterBackCityArt {
  /**
   * `MCM HAUS · {도시}` 캡션의 도시 표기.
   * 나라 코드를 그대로 찍지 않습니다 — 뮌헨처럼 실제 지명 표기(움라우트 등)가
   * `countryCode` 값과 다를 수 있어 나라마다 직접 적어 둡니다.
   */
  caption: string;
  image: ImageRequireSource;
  width: number;
  height: number;
}

/**
 * 편지 뒷면에 넣는 구매 국가별 캡션·그림. 도시마다 그림 원본 크기가 달라 폭·높이도 함께 둡니다.
 *
 * `GET /api/customers/arcs/{arcId}` 가 내려주는 `countryCode` 로 고릅니다 — 직원이 방문을
 * 기록할 때 고르는 `purchaseCountry`(`KR` `DE` `FR`)가 그대로 내려온 값이라, 매장의
 * `city_code` 컬럼과 달리 항상 채워져 있습니다.
 *
 * 처음에는 매장이 속한 도시(`cityCode`)로 고르려 했지만, 뮌헨·파리 매장은 아직 운영 DB 에
 * `city_code` 가 채워져 있지 않아(`docs/api-integration.md` "막힌 것" 7) 그 값으로는 서울
 * 매장 Arc 만 실제로 걸렸습니다. 구매 국가는 직원이 폼에서 직접 고르는 값이라 매장 등록
 * 상태와 상관없이 늘 있어, 이 기준으로 바꿨습니다.
 */
const LETTER_BACK_ART_BY_COUNTRY: Record<string, LetterBackCityArt> = {
  KR: { caption: 'MCM HAUS · SEOUL', image: letterSeoul, width: 316, height: 211 },
  DE: { caption: 'MCM HAUS · MÜNCHEN', image: letterMunich, width: 296, height: 197 },
  FR: { caption: 'MCM HAUS · PARIS', image: letterParis, width: 296, height: 197 },
};

/**
 * `countryCode` → 편지 뒷면 캡션·그림.
 * 모르는 값이거나 없으면 `undefined` 를 돌려주어 `ArcLetterBack` 이 빈 종이만 보여주게 둡니다.
 */
export function toLetterBackArt(
  countryCode: string | null | undefined
): LetterBackCityArt | undefined {
  return countryCode == null ? undefined : LETTER_BACK_ART_BY_COUNTRY[countryCode.toUpperCase()];
}

/** 시안에는 고객이 모두 `Ethan` 으로 그려져 있습니다. 자리 채우기용 이름입니다. */
const PLACE = 'MCM HAUS · SEOUL(REPUBLIC OF KOREA)';

/** 언어와 상관없이 그대로 두는 줄. 제품 이름과 영문 표기가 여기 들어갑니다. */
function asIs(line: string): LocalizedText {
  return { ko: line, en: line, zh: line, ja: line, ru: line, de: line, fr: line };
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
          de: 'Praktisches Design und ruhige Farben',
          fr: 'Un design pratique et des couleurs sobres',
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
          de: 'Das Stück, das Sie sich heute am genauesten angesehen haben, war die A Bag.',
          fr: "L'article que vous avez regardé le plus attentivement aujourd'hui était le A Bag.",
        },
      ],
    },
  ],
};
