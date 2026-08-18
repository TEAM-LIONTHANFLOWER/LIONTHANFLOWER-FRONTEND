/**
 * 고객 홈에 들어가는 브랜드 콘텐츠.
 * 문구와 사진은 시안(1-1 Home)을 그대로 옮긴 것입니다.
 *
 * 지금은 고정값입니다. 콘텐츠 API 가 붙으면 `@hooks` 의 쿼리 훅으로 옮깁니다.
 * 글은 고객이 고른 언어로 보여야 해서 언어별로 담아 두었습니다 — 서버가 내려줄
 * 모양과 같으므로 API 가 붙어도 읽는 쪽 코드는 그대로입니다.
 *
 * `Now On` `MCM Haus` `About MCM` 처럼 브랜드 이름과 영문 표제는 시안에서
 * 언어와 상관없이 그대로 쓰는 말이라 번역하지 않습니다.
 */

import { STUDIO_FRAME_IDS } from '@constants/studio';
import nowOnMcmHaus from '@assets/images/home/now-on-mcm-haus.jpg';
import type { BrandStory, NowOnFeature } from '@/types/home';
import type { StudioFrameId } from '@/types/studio';

export const NOW_ON_FEATURE: NowOnFeature = {
  id: 'mcm-haus',
  badge: 'Now On',
  title: 'MCM Haus',
  description: {
    ko: 'MCM HAUS는 문화·예술·패션이 결합된 MCM의 대표 플래그십 공간입니다. 단순한 판매 매장을 넘어, 전시와 협업을 통해 MCM의 창의성과 브랜드 세계관을 경험하는 공간으로 운영됩니다.',
    en: 'MCM HAUS is the flagship space where culture, art, and fashion come together. More than a store, it hosts exhibitions and collaborations that let you experience the creativity and the world of MCM.',
    zh: 'MCM HAUS 是融合文化、艺术与时尚的 MCM 旗舰空间。它不只是销售门店，更通过展览与跨界合作，呈现 MCM 的创意与品牌世界观。',
    ja: 'MCM HAUS は、カルチャー・アート・ファッションが交わる MCM のフラッグシップ空間です。単なる店舗ではなく、展示やコラボレーションを通じて MCM の創造性とブランドの世界観を体験できる場として運営されています。',
    ru: 'MCM HAUS — флагманское пространство бренда, где встречаются культура, искусство и мода. Это не просто магазин: выставки и коллаборации позволяют почувствовать творческую энергию MCM и мир бренда.',
  },
  image: nowOnMcmHaus,
};

/**
 * 머리말 바로 아래, `Now On` 카드 위에 놓이는 Arc 소개.
 * 시안(1-1 Home)에서 이 제목만 24 입니다.
 */
export const ARC_INTRO_STORY: BrandStory = {
  id: 'what-is-arc',
  title: 'What is Arc?',
  titleToken: 'titleEn24',
  body: {
    ko: '모든 방문은 당신의 이야기가 됩니다.\nWorldline은 MCM과 함께한 발견의 순간부터 만들어가는 추억까지, 당신만의 여정을 기록합니다.',
    en: 'Every visit becomes your story.\nWorldline records a journey that is yours alone — from the moment of discovery with MCM to the memories you go on to build.',
    zh: '每一次到访，都会成为你的故事。\nWorldline 记录属于你一个人的旅程——从与 MCM 相遇的发现瞬间，到你亲手创造的回忆。',
    ja: 'すべての来店が、あなたの物語になります。\nWorldline は MCM と出会った発見の瞬間から、育んでいく思い出まで、あなただけの旅を記録します。',
    ru: 'Каждый визит становится вашей историей.\nWorldline сохраняет путь, который принадлежит только вам, — от момента открытия вместе с MCM до воспоминаний, которые вы создаёте.',
  },
  bodyToken: 'bodyKo13',
};

/** `Now On` 카드 아래로 이어지는 브랜드 소개 글. */
export const BRAND_STORIES: readonly BrandStory[] = [
  {
    id: 'about-mcm',
    title: 'About MCM',
    titleToken: 'titleEn20',
    body: {
      ko: '1976년부터 MCM은 장인정신과 혁신을 바탕으로 전통적인 럭셔리의 개념을 새롭게 정의해왔습니다. 젊음과 독립성, 그리고 쉽게 알아볼 수 있는 디자인 감각을 지닌 MCM은 오늘도 세계를 움직이는 사람들과 함께합니다.',
      en: 'Since 1976, MCM has redefined traditional luxury through craftsmanship and innovation. With its spirit of youth, independence, and instantly recognizable design, MCM walks today with the people who move the world.',
      zh: '自 1976 年起，MCM 以匠心与创新重新定义传统奢华的概念。以年轻、独立以及一眼可辨的设计感，MCM 今天依然与推动世界前行的人们同行。',
      ja: '1976年以来、MCM は職人技と革新をもとに、伝統的なラグジュアリーの概念を新たに定義してきました。若さと自立、そして一目でそれとわかるデザイン感覚をもつ MCM は、今日も世界を動かす人々とともにあります。',
      ru: 'С 1976 года MCM заново определяет само понятие традиционной роскоши — через мастерство и новаторство. Молодость, независимость и мгновенно узнаваемый дизайн: MCM и сегодня идёт рядом с теми, кто движет мир.',
    },
    bodyToken: 'bodyKo14',
    // 시안에서 세 줄까지만 보이고 나머지는 말줄임표로 접혀 있습니다.
    maxLines: 3,
  },
] as const;

/**
 * `MCM Myself` 줄에 걸리는 프레임.
 * 시안이 Studio 의 네 프레임을 그대로 줄여 늘어놓습니다.
 *
 * 아직 고객이 만든 결과를 가져올 API 가 없어 프레임 원본을 그대로 보여 줍니다.
 * Studio 저장이 붙으면 고객이 실제로 만든 것만 남기고 이 목록은 지웁니다.
 */
export const MYSELF_FRAMES: readonly StudioFrameId[] = STUDIO_FRAME_IDS;
