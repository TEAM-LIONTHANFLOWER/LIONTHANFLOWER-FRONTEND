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
 * 색상 스킴과 무관하게 항상 같은 값을 쓰는 색상.
 * 스플래시·온보딩처럼 사진과 검정 배경 위에 고정된 화면, 그리고 웹 모바일 프레임에 씁니다.
 * 다크 모드에 따라 뒤집히면 안 되는 값이라 `Colors` 와 분리해 둡니다.
 *
 * 위의 `BrandColors` 는 Figma 원색 팔레트라 `Colors` 를 거쳐서만 쓰는 반면,
 * 여기 값들은 화면에서 곧바로 씁니다. 두 목록을 섞지 않습니다.
 */
export const FixedColors = {
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
  /** 어두운 배경 위 오류 안내 문구. 필수 표시(*)보다 밝혀 본문 크기에서도 읽히게 합니다. */
  errorOnDark: '#ff6b6b',
  /** 사진 위 가독성을 확보하는 어둡기. 그라데이션의 가장 짙은 지점이자 평평한 오버레이 값입니다. */
  scrim: 'rgba(0, 0, 0, 0.5)',
  /** 어두운 배경 위 고스트 버튼 테두리 */
  outlineOnDark: 'rgba(255, 255, 255, 0.6)',
  /**
   * 고른 항목의 밝은 면. 칩과 줄 목록이 선택되면 이 색으로 뒤집히고 글자는 `onLight` 가 됩니다.
   * 완전한 흰색이 아니라 90% 인 것은 뒤에 깔린 브랜드 배경이 살짝 비쳐야 하기 때문입니다.
   */
  selectedSurface: 'rgba(255, 255, 255, 0.9)',
  /** 아직 고르지 않은 줄 목록의 면. 어두운 배경에서 줄이 구분될 만큼만 밝힙니다. */
  optionSurface: 'rgba(255, 255, 255, 0.2)',
  /** 유리 가장자리 — 광원(좌상단) 쪽. 굴절로 가장 밝게 빛나는 지점입니다. */
  glassEdgeLit: 'rgba(255, 255, 255, 0.7)',
  /** 유리 가장자리 — 빛이 스쳐 지나가는 옆면. 여기서 가장 어둡습니다. */
  glassEdgeShade: 'rgba(255, 255, 255, 0.15)',
  /** 유리 가장자리 — 광원 반대쪽(우하단). 되비친 빛이 약하게 남습니다. */
  glassEdgeBounce: 'rgba(255, 255, 255, 0.5)',
  /** 선택되지 않은 페이지 인디케이터 */
  indicatorInactive: 'rgba(255, 255, 255, 0.5)',
  /** 하단 내비게이션에서 선택된 탭의 캡슐 배경 */
  navTabSelected: 'rgba(255, 255, 255, 0.20)',
  /** 웹 모바일 프레임 바깥. 프레임이 떠 보이도록 콘텐츠보다 어둡게 둡니다. */
  frameBackdrop: '#17181b',
  /**
   * 홈·Arc 계열 화면의 배경. Figma `Black` 과 같은 값입니다.
   * 시안의 모든 브랜드 화면이 이 한 색으로 깔려 있고, 색감은 그 위에 얹는 금빛 조명이 냅니다.
   */
  brandBackdrop: '#111111',
  /** 브랜드 배경 위에서 선택된 탭·칩. Figma `포인트 옐로우` 와 같은 값입니다. */
  highlight: '#ffda8e',
  /** 브랜드 배경 위에 얹는 밝은 카드 면. Figma `Warm Ivory` 와 같은 값입니다. */
  cardSurface: '#f7f3ec',
  /** 카드 제목과 상태 배지 바탕. Figma `Dark Leather Brown` 과 같은 값입니다. */
  cardAccent: '#6e4426',
  /** 밝은 카드 위에서 한 걸음 물러나는 글자. Arc 편지 맨 아래 발행 정보가 씁니다. */
  cardMuted: '#6b6b6b',
  /** 밝은 카드 위에 얹는 검은 알약 버튼 바탕 */
  solidButton: '#000000',
  /** Arc 봉투 겉면. Figma `MCM Cognac` 과 같은 값입니다. */
  envelopeSurface: '#a66a3f',
  /** Arc 봉투 테두리. 가죽 결이 배경에서 끊기지 않도록 한 톤 밝은 선으로 두릅니다. */
  envelopeEdge: '#b48460',
  /** 카드와 봉투가 배경에서 떠 보이게 하는 그림자 */
  cardShadow: '0px 4px 30px rgba(0, 0, 0, 0.25)',
  /** 떠 있는 하단 탭 바 뒤를 받치는 스크림 — 위쪽(투명) */
  tabBarScrimStart: 'rgba(0, 0, 0, 0)',
  /** 떠 있는 하단 탭 바 뒤를 받치는 스크림 — 아래쪽. 배경보다 더 짙게 떨어뜨려 바를 띄웁니다. */
  tabBarScrimEnd: '#000000',
  /** Studio 프레임 1 카드 바탕. */
  frameSurface: '#ffffff',
  /** Studio 프레임 1 텍스트 색. */
  frameCaptionBrown: '#774800',
  /** Studio 프레임 2 기록 상세 문구 색. */
  frameCaptionMauve: '#9d6969',
  /** Studio 프레임 4 카드 바탕. */
  frameSurfaceBlack: '#000000',
  /** Studio 프레임 1~4 의 사진 자리(빈칸)·프레임 2·3 카드 배경 공통 채움색. 흰색 20%. */
  frameWindowFill: 'rgba(255, 255, 255, 0.2)',
  /** Studio 생성 결과 화면의 삭제·공유 버튼 원 바탕. */
  resultActionSurface: '#ffffff',
} as const;

/**
 * 글꼴 규정.
 *
 * - **한글은 Pretendard(산세리프)만** 씁니다. 한글에 세리프를 쓰지 않습니다.
 * - **영문 타이틀은 Libre Baskerville(세리프)** 입니다. 브랜드의 헤리티지 톤을 담당합니다.
 * - 영문 본문도 Libre Baskerville 을 쓰되, 한글이 섞이면 Pretendard 로 통일합니다.
 * - **온보딩의 영문 보조 라벨만 DM Sans** 입니다. `label` 로 씁니다.
 *   Figma 텍스트 스타일에는 없는 글꼴이라 아래 `Typography` 에도 넣지 않습니다.
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
    label: 'var(--font-label)',
    inter: 'var(--font-inter)',
    mono: 'var(--font-mono)',
  },
  default: {
    sans: 'Pretendard',
    sansBold: 'Pretendard-Bold',
    serif: 'LibreBaskerville',
    serifSemiBold: 'LibreBaskerville-SemiBold',
    serifBold: 'LibreBaskerville-Bold',
    label: 'DMSans',
    inter: 'Inter',
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

/** 모서리 반경 토큰. */
export const Radius = {
  /** 봉투·편지지처럼 모서리만 살짝 다듬은 카드 */
  card: 4,
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
