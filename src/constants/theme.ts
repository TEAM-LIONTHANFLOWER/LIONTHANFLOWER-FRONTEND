/**
 * MCM Orbit 디자인 토큰.
 *
 * 색상과 타이포는 Figma 변수를 그대로 옮긴 것입니다.
 * https://www.figma.com/design/twoyAphrb3kNiPe55KHsXo/MCM-Orbit
 *
 * 값을 바꿔야 하면 Figma 변수를 먼저 고치고 여기에 반영합니다.
 * 이 파일의 값을 임의로 덮어쓰지 않습니다. 필요하면 새 토큰을 추가합니다.
 */

import { Platform, type TextStyle } from 'react-native';

import '@/global.css';

/**
 * 브랜드 원색 팔레트.
 *
 * 화면에서 직접 쓰지 않고 아래 `Colors` 를 거쳐 씁니다.
 * 원색을 바로 쓰면 다크 모드 대응이 빠집니다.
 */
export const BrandColors = {
  /** MCM Cognac — 대표 브랜드 컬러 */
  cognac: '#A66A3F',
  /** Visetos Light Cognac — 배경, 포인트 */
  lightCognac: '#C68B59',
  /** Dark Leather Brown — 헤더, 카드 */
  darkBrown: '#6E4426',
  /** Gold — 럭셔리 포인트 */
  gold: '#C8A96A',
  /** Dark Gold — hover, 버튼 눌림 */
  darkGold: '#9B7A42',
  /** 포인트 옐로우 — 선택·강조 배경 */
  pointYellow: '#FFDA8E',
  /** Warm Ivory — 메인 배경 */
  warmIvory: '#F7F3EC',
  /** Cream — 카드 배경 */
  cream: '#EFE6D6',
  /** Stone Gray — 밝은 배경에서는 대비가 낮아 구분선 용도로만 씁니다 */
  stoneGray: '#B7B2A8',
  /** Charcoal — 다크 UI 표면 */
  charcoal: '#2F2F2F',
  /** Black — 로고, 본문 텍스트 */
  black: '#111111',
  /** 기능색 — 오류, 삭제 */
  danger: '#CC1000',
} as const;

/**
 * 역할별 색상. `useThemeColors()` 로 가져다 씁니다.
 *
 * light / dark 의 키는 항상 같아야 합니다. `ThemeColor` 타입이 두 쪽의 교집합이라
 * 한쪽에만 있는 키는 타입 단계에서 걸러집니다.
 */
export const Colors = {
  light: {
    text: BrandColors.black,
    textSecondary: BrandColors.darkBrown,
    background: BrandColors.warmIvory,
    backgroundElement: BrandColors.cream,
    backgroundSelected: BrandColors.pointYellow,
    border: BrandColors.stoneGray,
    /** 기본 버튼·링크 등 주요 액션 */
    tint: BrandColors.cognac,
    /** 주요 액션 눌림 / hover */
    tintPressed: BrandColors.darkGold,
    /** `tint` 위에 올라가는 글자색 */
    onTint: BrandColors.warmIvory,
    /** 럭셔리 포인트 — 테두리, 아이콘 강조 */
    accent: BrandColors.gold,
    /** 은은한 강조 배경 */
    accentSoft: BrandColors.pointYellow,
    /** 헤더, 카드 바탕 */
    header: BrandColors.darkBrown,
    /** `header` 위에 올라가는 글자색 */
    onHeader: BrandColors.warmIvory,
    danger: BrandColors.danger,
  },
  dark: {
    text: BrandColors.warmIvory,
    textSecondary: BrandColors.stoneGray,
    background: BrandColors.black,
    backgroundElement: BrandColors.charcoal,
    backgroundSelected: BrandColors.darkBrown,
    border: BrandColors.darkBrown,
    tint: BrandColors.lightCognac,
    tintPressed: BrandColors.gold,
    onTint: BrandColors.black,
    accent: BrandColors.gold,
    accentSoft: BrandColors.pointYellow,
    header: BrandColors.darkBrown,
    onHeader: BrandColors.warmIvory,
    danger: BrandColors.danger,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * 글꼴 규정.
 *
 * - **한글은 Pretendard(산세리프)만** 씁니다. 한글에 세리프를 쓰지 않습니다.
 * - **영문 타이틀은 Libre Baskerville(세리프)** 입니다. 브랜드의 헤리티지 톤을 담당합니다.
 * - 영문 본문도 Libre Baskerville 을 쓰되, 한글이 섞이면 Pretendard 로 통일합니다.
 *
 * 커스텀 글꼴은 네이티브에서 `fontWeight` 로 굵기를 고르지 못합니다.
 * 굵기마다 패밀리를 따로 등록해야 해서 `*Bold` / `*SemiBold` 를 나눠 둡니다.
 * 등록 이름은 `@hooks/use-brand-fonts` 의 키와 반드시 같아야 합니다.
 */
export const FontFamily = Platform.select({
  web: {
    sans: 'var(--font-sans)',
    sansBold: 'var(--font-sans)',
    serif: 'var(--font-serif)',
    serifSemiBold: 'var(--font-serif)',
    serifBold: 'var(--font-serif)',
    mono: 'var(--font-mono)',
  },
  default: {
    sans: 'Pretendard',
    sansBold: 'Pretendard-Bold',
    serif: 'LibreBaskerville',
    serifSemiBold: 'LibreBaskerville-SemiBold',
    serifBold: 'LibreBaskerville-Bold',
    mono: 'monospace',
  },
});

type BrandFontWeight = {
  regular: TextStyle['fontWeight'];
  semiBold: TextStyle['fontWeight'];
  bold: TextStyle['fontWeight'];
};

/**
 * 굵기를 지정하는 방식이 플랫폼마다 다릅니다.
 *
 * - 웹: `@font-face` 에 400 / 600 / 700 이 같은 패밀리로 등록돼 있어 `fontWeight` 로 고릅니다.
 * - 네이티브: 굵기별로 패밀리가 따로라, 여기에 `fontWeight` 까지 주면
 *   Android 가 Bold 글꼴에 합성 볼드를 한 번 더 얹어 뭉개집니다.
 */
export const FontWeight: BrandFontWeight = Platform.select({
  web: { regular: '400', semiBold: '600', bold: '700' },
  default: { regular: undefined, semiBold: undefined, bold: undefined },
});

/** Figma 타이포 스타일의 행간 비율. 64 타이틀만 130%, 나머지는 150% 입니다. */
export const LineHeightRatio = {
  base: 1.5,
  display: 1.3,
} as const;

/**
 * 텍스트 스타일. Figma 의 텍스트 스타일 8개와 1:1 로 대응합니다.
 * 토큰 이름 뒤의 숫자가 Figma 스타일 이름의 숫자입니다.
 *
 * 여기에 없는 크기가 필요하면 임의로 만들지 말고
 * Figma 에 텍스트 스타일을 먼저 추가한 뒤 이 목록에 옮깁니다.
 */
export const Typography = {
  /** 한글 본문 13 — Pretendard Regular 13 / 150% */
  bodyKo13: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    lineHeight: 13 * LineHeightRatio.base,
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
  },
  /** 한글본문 14 — Pretendard Regular 14 / 150% */
  bodyKo14: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    lineHeight: 14 * LineHeightRatio.base,
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
  },
  /** 영문 본문 14 — Libre Baskerville Regular 14 / 150% */
  bodyEn14: {
    fontFamily: FontFamily.serif,
    fontSize: 14,
    lineHeight: 14 * LineHeightRatio.base,
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
  },
  /** 영문 타이틀 14 — Libre Baskerville SemiBold 14 / 150% */
  titleEn14: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 14,
    lineHeight: 14 * LineHeightRatio.base,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0,
  },
  /** 영문 타이틀 16 — Libre Baskerville SemiBold 16 / 150% */
  titleEn16: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 16,
    lineHeight: 16 * LineHeightRatio.base,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0,
  },
  /** 영문 타이틀 20 — Libre Baskerville Bold 20 / 150% */
  titleEn20: {
    fontFamily: FontFamily.serifBold,
    fontSize: 20,
    lineHeight: 20 * LineHeightRatio.base,
    fontWeight: FontWeight.bold,
    letterSpacing: 0,
  },
  /** 영문 타이틀 24 — Libre Baskerville Bold 24 / 150% */
  titleEn24: {
    fontFamily: FontFamily.serifBold,
    fontSize: 24,
    lineHeight: 24 * LineHeightRatio.base,
    fontWeight: FontWeight.bold,
    letterSpacing: 0,
  },
  /** 영문 타이틀 64 — Libre Baskerville SemiBold 64 / 130% (스플래시 등 대형 타이틀) */
  titleEn64: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 64,
    lineHeight: 64 * LineHeightRatio.display,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof Typography;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
