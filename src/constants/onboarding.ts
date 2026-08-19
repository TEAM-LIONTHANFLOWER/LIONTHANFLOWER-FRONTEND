/**
 * 온보딩 슬라이드 데이터.
 * 문구는 시안(0-2-1 / 0-2-2 / 0-2-3)의 영문 카피를 그대로 씁니다.
 */

import aboutBackground from '@assets/images/onboarding/about.jpg';
import magazineBackground from '@assets/images/onboarding/magazine.jpg';
import newOnesBackground from '@assets/images/onboarding/new-ones.jpg';
import type { MessageKey } from '@/types/i18n';
import type { OnboardingSlide, ServiceStyleCode, ServiceStyleOption } from '@/types/onboarding';
import type { InteractionStyle } from '@/types/visit';

export const ONBOARDING_SLIDES: readonly OnboardingSlide[] = [
  {
    id: 'magazine',
    background: magazineBackground,
    title: ['MCM', 'MAGAZINE'],
    description: ['Ideas, culture, craftsmanship, and', 'the people who move the world.'],
  },
  {
    id: 'new-ones',
    background: newOnesBackground,
    title: ['MCM', 'NEW ONES'],
    description: ['Discover the latest collection', 'designed for every move.'],
  },
  {
    id: 'about',
    background: aboutBackground,
    title: ['About', 'MCM Orbit'],
    description: [
      'Your Next Journey Begins',
      'Discover the latest collection',
      'curated for the way you move.',
    ],
    titleLetterSpacing: 1.28,
  },
] as const;

/**
 * 정보 입력 화면의 Service Style 선택지. 두 가지뿐이고, 첫 항목이 기본값입니다.
 * Language 칩 목록은 고객·직원이 함께 쓰므로 `@constants/languages` 에 있습니다.
 */
export const SERVICE_STYLES: readonly ServiceStyleOption[] = [
  { code: 'recommendation', labelKey: 'serviceStyle.recommendation' },
  { code: 'self-guided', labelKey: 'serviceStyle.selfGuided' },
] as const;

/** 화면의 Service Style 선택 → 서버가 받는 접객 방식(`interactionStyle`). */
export const INTERACTION_STYLE_BY_SERVICE_STYLE: Record<ServiceStyleCode, InteractionStyle> = {
  recommendation: 'STAFF_RECOMMENDATION',
  'self-guided': 'SELF_GUIDED',
};

/**
 * 서버가 받는 접객 방식 → 그 뜻을 적은 문구 키.
 *
 * `Initial setup` 팝업이 고객이 고른 응대 방식을 되짚어 보여줄 때 씁니다.
 * 위 표의 정확한 반대 방향이라 되돌려도 값이 뭉개지지 않습니다.
 */
export const SERVICE_STYLE_LABEL_KEY: Record<InteractionStyle, MessageKey> = {
  STAFF_RECOMMENDATION: 'serviceStyle.recommendation',
  SELF_GUIDED: 'serviceStyle.selfGuided',
};
