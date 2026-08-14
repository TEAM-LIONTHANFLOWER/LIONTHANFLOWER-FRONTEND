/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * 색상 스킴과 무관하게 항상 같은 값을 쓰는 색상.
 * 스플래시·온보딩처럼 사진과 검정 배경 위에 고정된 화면, 그리고 웹 모바일 프레임에 씁니다.
 * 다크 모드에 따라 뒤집히면 안 되는 값이라 `Colors` 와 분리해 둡니다.
 */
export const BrandColors = {
  /** 스플래시 배경 */
  splashBackground: '#000000',
  /** 어두운 배경 위의 텍스트·아이콘 */
  onDark: '#ffffff',
  /** 흰 면 위의 텍스트·아이콘. 선택된 칩처럼 명암이 뒤집힌 요소에 씁니다. */
  onLight: '#000000',
  /** 어두운 배경 위 입력 필드의 플레이스홀더 */
  placeholderOnDark: '#767676',
  /** 필수 입력 표시(*) */
  required: '#ff3333',
  /** 사진 위 가독성을 확보하는 어둡기. 그라데이션의 가장 짙은 지점이자 평평한 오버레이 값입니다. */
  scrim: 'rgba(0, 0, 0, 0.5)',
  /** 어두운 배경 위 고스트 버튼 테두리 */
  outlineOnDark: 'rgba(255, 255, 255, 0.6)',
  /** 유리 가장자리 — 광원(좌상단) 쪽. 굴절로 가장 밝게 빛나는 지점입니다. */
  glassEdgeLit: 'rgba(255, 255, 255, 0.7)',
  /** 유리 가장자리 — 빛이 스쳐 지나가는 옆면. 여기서 가장 어둡습니다. */
  glassEdgeShade: 'rgba(255, 255, 255, 0.15)',
  /** 유리 가장자리 — 광원 반대쪽(우하단). 되비친 빛이 약하게 남습니다. */
  glassEdgeBounce: 'rgba(255, 255, 255, 0.5)',
  /** 선택되지 않은 페이지 인디케이터 */
  indicatorInactive: 'rgba(255, 255, 255, 0.5)',
  /** 웹 모바일 프레임 바깥. 프레임이 떠 보이도록 콘텐츠보다 어둡게 둡니다. */
  frameBackdrop: '#17181b',
} as const;

/**
 * 번들된 커스텀 폰트의 패밀리 이름.
 * `src/app/_layout.tsx` 의 `useFonts()` 에 등록하는 키와 반드시 같아야 합니다.
 * 플랫폼 기본 서체 스택은 아래 `Fonts` 를 씁니다.
 */
export const FontFamily = {
  /** Libre Baskerville Regular — 영문 본문 */
  displayRegular: 'LibreBaskerville-Regular',
  /** Libre Baskerville SemiBold — 영문 타이틀 */
  displaySemiBold: 'LibreBaskerville-SemiBold',
  /** DM Sans Regular — 보조 라벨 */
  labelRegular: 'DMSans-Regular',
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** 모서리 반경 토큰. */
export const Radius = {
  /** 양 끝이 완전히 둥근 알약 모양 */
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * 웹에서 앱을 가두는 모바일 프레임 폭. 시안이 그려진 iPhone 14 Pro 와 같은 값입니다.
 * 높이는 제한하지 않고 브라우저를 꽉 채웁니다.
 */
export const MobileFrameWidth = 393;
