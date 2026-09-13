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

import type { BrandStory, NowOnFeature } from '@/types/home';
import type { StudioFrameId } from '@/types/studio';
import nowOnMcmHaus from '@assets/images/home/now-on-mcm-haus.jpg';
import { STUDIO_FRAME_IDS } from '@constants/studio';

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
    de: 'MCM HAUS ist der Flagship-Raum, in dem Kultur, Kunst und Mode zusammenkommen. Mehr als ein Geschäft: Ausstellungen und Kooperationen lassen Sie die Kreativität und die Welt von MCM erleben.',
    fr: "MCM HAUS est l'espace phare où se rencontrent la culture, l'art et la mode. Plus qu'une boutique, il accueille des expositions et des collaborations qui vous font vivre la créativité et l'univers de MCM.",
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
    de: 'Jeder Besuch wird zu Ihrer Geschichte.\nWorldline hält einen Weg fest, der allein Ihnen gehört – vom Moment der Entdeckung mit MCM bis zu den Erinnerungen, die Sie später schaffen.',
    fr: "Chaque visite devient votre histoire.\nWorldline enregistre un parcours qui n'appartient qu'à vous, du moment de la découverte avec MCM jusqu'aux souvenirs que vous construisez ensuite.",
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
      ko: 'MCM은 1976년 독일 뮌헨에서 탄생한 럭셔리 브랜드로,\n 현대적인 감각과 기능성을 바탕으로 혁신적인 액세서리를 \n선보입니다. 전통적인 디자인을 미래지향적으로 재해석하며\n새로운 스타일을 제안합니다.\n\n뮌헨과 서울에서 영감을 받아 글로벌 감성을 담아내며, 나이와 성별의 경계를 넘어 자유로운 라이프스타일을 추구합니다.\n현재 전 세계 35개국에서 430여 개 매장을 운영하고\n있습니다.',
      en: 'MCM is a luxury brand born in Munich, Germany in 1976, offering innovative accessories built on modern sensibility and functionality. It reinterprets traditional design with a forward-looking vision, proposing a new style.\nDrawing inspiration from Munich and Seoul, MCM captures a global sensibility and pursues a free lifestyle beyond the boundaries of age and gender. Today, it operates more than 430 stores across 35 countries worldwide.',
      zh: 'MCM 是 1976 年诞生于德国慕尼黑的奢侈品牌，以现代感与实用性为基础，呈现创新的配饰。品牌以未来视角重新诠释传统设计，提出全新风格。\n从慕尼黑与首尔汲取灵感，MCM 融入全球化的感性，超越年龄与性别的界限，追求自由的生活方式。目前，MCM 在全球 35 个国家运营着 430 余家门店。',
      ja: 'MCM は 1976 年にドイツ・ミュンヘンで誕生したラグジュアリーブランドで、モダンな感性と機能性をもとに革新的なアクセサリーを展開しています。伝統的なデザインを未来志向に再解釈し、新しいスタイルを提案します。\nミュンヘンとソウルからインスピレーションを得てグローバルな感性を取り入れ、年齢や性別の垣根を越えた自由なライフスタイルを追求しています。現在、世界 35 か国で 430 以上の店舗を展開しています。',
      ru: 'MCM — люксовый бренд, рождённый в 1976 году в Мюнхене, Германия. Он создаёт инновационные аксессуары на основе современной эстетики и функциональности, переосмысливая традиционный дизайн в духе будущего и предлагая новый стиль.\nВдохновляясь Мюнхеном и Сеулом, MCM воплощает глобальную чувственность и стремится к свободному образу жизни вне границ возраста и пола. Сегодня бренд управляет более чем 430 магазинами в 35 странах мира.',
      de: 'MCM ist eine 1976 in München, Deutschland gegründete Luxusmarke, die innovative Accessoires auf der Basis von moderner Ästhetik und Funktionalität schafft. Traditionelles Design wird zukunftsweisend neu interpretiert und zu einem neuen Stil geformt.\nInspiriert von München und Seoul verbindet MCM eine globale Sensibilität und strebt einen freien Lebensstil jenseits der Grenzen von Alter und Geschlecht an. Heute betreibt die Marke mehr als 430 Geschäfte in 35 Ländern weltweit.',
      fr: "MCM est une marque de luxe née à Munich, en Allemagne, en 1976, qui propose des accessoires innovants fondés sur une sensibilité moderne et la fonctionnalité. Elle réinterprète le design traditionnel avec une vision tournée vers l'avenir et propose un style nouveau.\nS'inspirant de Munich et de Séoul, MCM incarne une sensibilité globale et poursuit un style de vie libre, au-delà des frontières de l'âge et du genre. Aujourd'hui, la marque compte plus de 430 boutiques dans 35 pays à travers le monde.",
    },
    bodyToken: 'bodyKo14',
    // 시안은 세 줄만 보이고 나머지를 말줄임표로 접었지만, 언어마다 글 길이가 달라
    // 고정된 줄 수로는 프랑스어·독일어처럼 더 긴 언어가 중간에 잘립니다. 전문을 그대로 보여줍니다.
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
