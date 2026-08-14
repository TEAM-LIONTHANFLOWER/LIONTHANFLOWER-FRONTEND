/**
 * 온보딩 슬라이드 데이터.
 * 문구는 시안(0-2-1 / 0-2-2 / 0-2-3)의 영문 카피를 그대로 씁니다.
 */

import aboutBackground from '@assets/images/onboarding/about.jpg';
import magazineBackground from '@assets/images/onboarding/magazine.jpg';
import newOnesBackground from '@assets/images/onboarding/new-ones.jpg';
import type {
  OnboardingSlide,
  ServiceLanguageOption,
  ServiceStyleOption,
} from '@/types/onboarding';

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
 * 정보 입력 화면의 Language 칩.
 *
 * 시안에는 칩이 6 개인데 뒤쪽 셋이 모두 `Japanese` 로 그려져 있어(자리 채우기),
 * 줄바꿈 모양은 그대로 두고 실제 언어로 채웠습니다.
 */
export const SERVICE_LANGUAGES: readonly ServiceLanguageOption[] = [
  { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
] as const;

/** 정보 입력 화면의 Service Style 선택지. 두 가지뿐이고, 첫 항목이 기본값입니다. */
export const SERVICE_STYLES: readonly ServiceStyleOption[] = [
  { code: 'recommendation', label: '직원의 추천을 받고 싶어요' },
  { code: 'self-guided', label: '혼자 보고 싶어요' },
] as const;
