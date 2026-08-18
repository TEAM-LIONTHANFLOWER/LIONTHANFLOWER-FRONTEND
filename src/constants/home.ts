/**
 * 고객 홈에 들어가는 브랜드 콘텐츠.
 * 문구와 사진은 시안(1-1 Home)을 그대로 옮긴 것입니다.
 *
 * 지금은 고정값입니다. 콘텐츠 API 가 붙으면 `@hooks` 의 쿼리 훅으로 옮깁니다.
 */

import myselfElevator from '@assets/images/home/myself-elevator.jpg';
import nowOnMcmHaus from '@assets/images/home/now-on-mcm-haus.jpg';
import type { BrandStory, MyselfPhoto, NowOnFeature } from '@/types/home';

export const NOW_ON_FEATURE: NowOnFeature = {
  id: 'mcm-haus',
  badge: 'Now On',
  title: 'MCM Haus',
  description:
    'MCM HAUS는 문화·예술·패션이 결합된 MCM의 대표 플래그십 공간입니다. 단순한 판매 매장을 넘어, 전시와 협업을 통해 MCM의 창의성과 브랜드 세계관을 경험하는 공간으로 운영됩니다.',
  image: nowOnMcmHaus,
};

export const BRAND_STORIES: readonly BrandStory[] = [
  {
    id: 'about-mcm',
    title: 'About MCM',
    body: '1976년부터 MCM은 장인정신과 혁신을 바탕으로 전통적인 럭셔리의 개념을 새롭게 정의해왔습니다. 젊음과 독립성, 그리고 쉽게 알아볼 수 있는 디자인 감각을 지닌 MCM은 오늘도 세계를 움직이는 사람들과 함께합니다.',
    bodyToken: 'bodyKo14',
    // 시안에서 세 줄까지만 보이고 나머지는 말줄임표로 접혀 있습니다.
    maxLines: 3,
  },
  {
    id: 'what-is-arc',
    title: 'What is Arc?',
    body: '모든 방문은 당신의 이야기가 됩니다.\nWorldline은 MCM과 함께한 발견의 순간부터 만들어가는 추억까지, 당신만의 여정을 기록합니다.',
    bodyToken: 'bodyKo13',
  },
] as const;

/**
 * `MCM Myself` 갤러리 사진.
 * 시안에는 같은 사진이 세 장 걸려 있습니다. 자리와 개수를 맞추려고 그대로 두었고,
 * 콘텐츠 API 가 붙으면 실제 화보로 교체합니다.
 */
export const MYSELF_PHOTOS: readonly MyselfPhoto[] = [
  { id: 'myself-1', image: myselfElevator, description: 'MCM 백팩을 멘 모델 화보' },
  { id: 'myself-2', image: myselfElevator, description: 'MCM 백팩을 멘 모델 화보' },
  { id: 'myself-3', image: myselfElevator, description: 'MCM 백팩을 멘 모델 화보' },
] as const;
