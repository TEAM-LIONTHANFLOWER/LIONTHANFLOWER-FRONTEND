/**
 * 온보딩 슬라이드 데이터.
 * 문구는 시안(0-2-1 / 0-2-2 / 0-2-3)의 영문 카피를 그대로 씁니다.
 */

import aboutBackground from '@assets/images/onboarding/about.jpg';
import magazineBackground from '@assets/images/onboarding/magazine.jpg';
import newOnesBackground from '@assets/images/onboarding/new-ones.jpg';
import type { OnboardingSlide } from '@/types/onboarding';

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
