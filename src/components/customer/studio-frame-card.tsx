/**
 * Studio 화면에서 고를 수 있는 프레임 카드 하나.
 * 프레임 1~4 는 디자인이 서로 완전히 다른 레이아웃이라, 공통 컴포넌트 안에서
 * `frameId` 값에 따라 마스크·로고·기록 상세 텍스트 배치를 통째로 갈아 끼웁니다.
 */
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { StudioFrameId } from '@/types/studio';
import mcmWordmark from '@assets/images/home/mcm-wordmark.png';
import frame01Logo from '@assets/images/studio/frame01_logo.svg';
import frame01Seoul from '@assets/images/studio/frame01_seoul.png';
import frame02Logo from '@assets/images/studio/frame02_logo.svg';
import frame03Logo from '@assets/images/studio/frame03.svg';
import frame04Logo from '@assets/images/studio/frame04.svg';
import { FixedColors, FontFamily, FontWeight, LineHeightRatio } from '@constants/theme';

/** 프레임 1~4 가 함께 쓰는 기록 상세 문구. */
const ARC_DETAIL_TEXT = 'Today\'s Arc\nMCM Haus\nApgujeong\n2026.08.12\n"Urban Escape"';

/** 시안의 프레임 한 장 치수. 네 프레임이 모두 같은 크기입니다. */
export const STUDIO_FRAME_WIDTH = 211;
export const STUDIO_FRAME_HEIGHT = 458;

/** 프레임 1 — 왼쪽 위 로고. */
const FRAME01_LOGO_WIDTH = 30;
const FRAME01_LOGO_HEIGHT = 27;
const FRAME01_LOGO_TOP = 19;
const FRAME01_LOGO_LEFT = 12;

/** 프레임 1 — 로고 아래 매장 표기. */
const FRAME01_CAPTION = 'MCM HAUS · SEOUL';
const FRAME01_CAPTION_TOP = 72;
const FRAME01_CAPTION_LEFT = 47;
const FRAME01_CAPTION_FONT_SIZE = 12;

/** 프레임 1 — 오른쪽에 붙는 기록 상세. */
const FRAME01_DETAIL_TOP = 104;
const FRAME01_DETAIL_RIGHT = 9;
const FRAME01_DETAIL_FONT_SIZE = 9;

/** 프레임 1 — 맨 아래 가운데 사진. */
const FRAME01_PHOTO_WIDTH = 147;
const FRAME01_PHOTO_HEIGHT = 98;
const FRAME01_PHOTO_BOTTOM = 4;

/**
 * 프레임 1 — 사진이 들어갈 자리를 뚫어 둔 창.
 * 왼쪽 여백이 0이라 왼쪽 끝까지 뚫려 있습니다. 나머지 세 방향만 흰 바탕으로 가려 창 모양을 냅니다.
 */
const FRAME01_WINDOW_HEIGHT = 247;
const FRAME01_WINDOW_TOP = 105;
const FRAME01_WINDOW_RIGHT = 81;

/** 프레임 2 — 위에서부터 폭 꽉 채운 로고. 원본 비율(211×146)을 그대로 씁니다. */
const FRAME02_LOGO_HEIGHT = 146;

/** 프레임 2 — 로고 위에 겹치는 기록 상세. */
const FRAME02_DETAIL_TOP = 21;
const FRAME02_DETAIL_RIGHT = 18;
const FRAME02_DETAIL_FONT_SIZE = 9;

/** 프레임 2 — 워드마크는 맨 아래에 남습니다. */
const FRAME02_WORDMARK_WIDTH = 40;
const FRAME02_WORDMARK_HEIGHT = 37;
const FRAME02_WORDMARK_LEFT = 8;
const FRAME02_WORDMARK_BOTTOM = 7;

/** 프레임 3 — 아래에 꽉 들어맞는 로고. 원본 비율(211×229)을 그대로 씁니다. */
const FRAME03_LOGO_HEIGHT = 229;

/** 프레임 3 — 로고 위에 겹치는 기록 상세. */
const FRAME03_DETAIL_LEFT = 18;
const FRAME03_DETAIL_BOTTOM = 18;
const FRAME03_DETAIL_FONT_SIZE = 9;

/** 프레임 4 — 맨 왼쪽에 딱 맞는 로고. 원본 비율(86×458)을 그대로 씁니다. */
const FRAME04_LOGO_WIDTH = 86;

/** 프레임 4 — 로고 위에 겹치는 기록 상세. */
const FRAME04_DETAIL_RIGHT = 15;
const FRAME04_DETAIL_BOTTOM = 19;
const FRAME04_DETAIL_FONT_SIZE = 9;

/**
 * 프레임 4 — 사진이 들어갈 자리를 뚫어 둔 창.
 * 검정 바탕을 넷으로 잘라 창 둘레만 가리고, 로고는 창 위에 그대로 겹쳐 보이게 나중에 그립니다.
 */
const FRAME04_WINDOW_WIDTH = 184;
const FRAME04_WINDOW_HEIGHT = 184;
const FRAME04_WINDOW_TOP = 57;
const FRAME04_WINDOW_LEFT = 13;

interface StudioFrameCardProps {
  frameId: StudioFrameId;
  /** 지금 고른 프레임인지. 고를 수 없는 자리에서는 뜻이 없어 생략합니다. */
  selected?: boolean;
  /**
   * 누르면 이 프레임을 고릅니다.
   * 생략하면 누를 수 없는 그림 한 장이 됩니다 — 홈의 `MCM Myself` 줄과 Studio 결과 화면처럼
   * 이미 정해진 프레임을 보여 주기만 하는 자리에서 그렇게 씁니다.
   */
  onSelect?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Studio 화면에서 고를 수 있는 프레임 한 장.
 * 프레임마다 디자인이 완전히 달라서 `frameId` 로 내용만 갈아 끼웁니다.
 */
export function StudioFrameCard({
  frameId,
  selected = false,
  onSelect,
  style,
}: StudioFrameCardProps) {
  const label = `프레임 ${frameId.slice(-2)}`;
  const frameStyle = [
    styles.frame,
    (frameId === 'frame-02' || frameId === 'frame-03') && styles.frameWindowBackground,
    style,
  ];

  const art = (
    <>
      {frameId === 'frame-01' ? (
        <>
          {/* 흰 바탕을 셋으로 잘라 사진 자리만 남기고, 그 자리는 공통 채움색으로 채웁니다. */}
          <View style={styles.frame01MaskTop} />
          <View style={styles.frame01MaskBottom} />
          <View style={styles.frame01MaskRight} />
          <View style={styles.frame01Window} />

          <Image
            source={frame01Logo}
            style={styles.frame01Logo}
            contentFit="contain"
            accessible={false}
          />
          <Text style={styles.frame01Caption}>{FRAME01_CAPTION}</Text>
          <Text style={styles.frame01Detail}>{ARC_DETAIL_TEXT}</Text>

          <View style={styles.frame01PhotoRow}>
            <Image
              source={frame01Seoul}
              style={styles.frame01Photo}
              contentFit="cover"
              accessible={false}
            />
          </View>
        </>
      ) : null}

      {frameId === 'frame-02' ? (
        <>
          {/* 카드 전체가 공통 채움색이고, 로고는 그 위에 그대로 얹힙니다. */}
          <Image
            source={frame02Logo}
            style={styles.frame02Logo}
            contentFit="contain"
            accessible={false}
          />
          <Text style={styles.frame02Detail}>{ARC_DETAIL_TEXT}</Text>

          <Image
            source={mcmWordmark}
            style={styles.frame02Wordmark}
            contentFit="contain"
            accessibilityLabel="MCM"
          />
        </>
      ) : null}

      {frameId === 'frame-03' ? (
        <>
          {/* 카드 전체가 공통 채움색이고, 로고는 그 위에 그대로 얹힙니다. */}
          <Image
            source={frame03Logo}
            style={styles.frame03Logo}
            contentFit="contain"
            accessible={false}
          />
          <Text style={styles.frame03Detail}>{ARC_DETAIL_TEXT}</Text>
        </>
      ) : null}

      {frameId === 'frame-04' ? (
        <>
          {/* 검정 바탕을 넷으로 잘라 사진 자리만 남기고, 그 자리는 공통 채움색으로 채웁니다. 로고는 그 위에 그대로 겹칩니다. */}
          <View style={styles.frame04MaskTop} />
          <View style={styles.frame04MaskBottom} />
          <View style={styles.frame04MaskLeft} />
          <View style={styles.frame04MaskRight} />
          <View style={styles.frame04Window} />

          <Image
            source={frame04Logo}
            style={styles.frame04Logo}
            contentFit="contain"
            accessible={false}
          />
          <Text style={styles.frame04Detail}>{ARC_DETAIL_TEXT}</Text>
        </>
      ) : null}
    </>
  );

  // 고를 수 없는 자리에서는 누르기를 받지 않고 그림 한 장으로만 놓습니다.
  if (onSelect === undefined) {
    return (
      <View accessibilityRole="image" accessibilityLabel={label} style={frameStyle}>
        {art}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onSelect}
      style={frameStyle}
    >
      {art}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: STUDIO_FRAME_WIDTH,
    height: STUDIO_FRAME_HEIGHT,
    overflow: 'hidden',
  },
  // 프레임 2·3 전용. 카드 전체를 공통 채움색으로 깔고 그 위에 svg 로고를 얹습니다.
  frameWindowBackground: {
    backgroundColor: FixedColors.frameWindowFill,
  },
  frame01MaskTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: FRAME01_WINDOW_TOP,
    backgroundColor: FixedColors.frameSurface,
  },
  frame01MaskBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: STUDIO_FRAME_HEIGHT - FRAME01_WINDOW_TOP - FRAME01_WINDOW_HEIGHT,
    backgroundColor: FixedColors.frameSurface,
  },
  frame01MaskRight: {
    position: 'absolute',
    top: FRAME01_WINDOW_TOP,
    right: 0,
    width: FRAME01_WINDOW_RIGHT,
    height: FRAME01_WINDOW_HEIGHT,
    backgroundColor: FixedColors.frameSurface,
  },
  frame01Window: {
    position: 'absolute',
    top: FRAME01_WINDOW_TOP,
    left: 0,
    right: FRAME01_WINDOW_RIGHT,
    height: FRAME01_WINDOW_HEIGHT,
    backgroundColor: FixedColors.frameWindowFill,
  },
  frame01Logo: {
    position: 'absolute',
    top: FRAME01_LOGO_TOP,
    left: FRAME01_LOGO_LEFT,
    width: FRAME01_LOGO_WIDTH,
    height: FRAME01_LOGO_HEIGHT,
  },
  frame01Caption: {
    position: 'absolute',
    top: FRAME01_CAPTION_TOP,
    left: FRAME01_CAPTION_LEFT,
    fontFamily: FontFamily.inter,
    fontSize: FRAME01_CAPTION_FONT_SIZE,
    lineHeight: FRAME01_CAPTION_FONT_SIZE * LineHeightRatio.base,
    fontWeight: FontWeight.regular,
    color: FixedColors.frameCaptionBrown,
  },
  frame01Detail: {
    position: 'absolute',
    top: FRAME01_DETAIL_TOP,
    right: FRAME01_DETAIL_RIGHT,
    fontFamily: FontFamily.sans,
    fontSize: FRAME01_DETAIL_FONT_SIZE,
    lineHeight: FRAME01_DETAIL_FONT_SIZE * LineHeightRatio.base,
    fontWeight: FontWeight.regular,
    color: FixedColors.frameCaptionBrown,
    textAlign: 'right',
  },
  // 사진 폭이 프레임 폭보다 좁아, 줄을 꽉 채우고 가운데 정렬로 앉힙니다.
  frame01PhotoRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: FRAME01_PHOTO_BOTTOM,
    alignItems: 'center',
  },
  frame01Photo: {
    width: FRAME01_PHOTO_WIDTH,
    height: FRAME01_PHOTO_HEIGHT,
  },
  frame02Logo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: STUDIO_FRAME_WIDTH,
    height: FRAME02_LOGO_HEIGHT,
  },
  frame02Detail: {
    position: 'absolute',
    top: FRAME02_DETAIL_TOP,
    right: FRAME02_DETAIL_RIGHT,
    fontFamily: FontFamily.sans,
    fontSize: FRAME02_DETAIL_FONT_SIZE,
    lineHeight: FRAME02_DETAIL_FONT_SIZE * LineHeightRatio.base,
    fontWeight: FontWeight.regular,
    color: FixedColors.frameCaptionMauve,
    textAlign: 'right',
  },
  frame02Wordmark: {
    position: 'absolute',
    left: FRAME02_WORDMARK_LEFT,
    bottom: FRAME02_WORDMARK_BOTTOM,
    width: FRAME02_WORDMARK_WIDTH,
    height: FRAME02_WORDMARK_HEIGHT,
  },
  frame03Logo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: STUDIO_FRAME_WIDTH,
    height: FRAME03_LOGO_HEIGHT,
  },
  frame03Detail: {
    position: 'absolute',
    left: FRAME03_DETAIL_LEFT,
    bottom: FRAME03_DETAIL_BOTTOM,
    fontFamily: FontFamily.sans,
    fontSize: FRAME03_DETAIL_FONT_SIZE,
    lineHeight: FRAME03_DETAIL_FONT_SIZE * LineHeightRatio.base,
    fontWeight: FontWeight.regular,
    color: FixedColors.onLight,
  },
  frame04MaskTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: FRAME04_WINDOW_TOP,
    backgroundColor: FixedColors.frameSurfaceBlack,
  },
  frame04MaskBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: STUDIO_FRAME_HEIGHT - FRAME04_WINDOW_TOP - FRAME04_WINDOW_HEIGHT,
    backgroundColor: FixedColors.frameSurfaceBlack,
  },
  frame04MaskLeft: {
    position: 'absolute',
    top: FRAME04_WINDOW_TOP,
    left: 0,
    width: FRAME04_WINDOW_LEFT,
    height: FRAME04_WINDOW_HEIGHT,
    backgroundColor: FixedColors.frameSurfaceBlack,
  },
  frame04MaskRight: {
    position: 'absolute',
    top: FRAME04_WINDOW_TOP,
    right: 0,
    width: STUDIO_FRAME_WIDTH - FRAME04_WINDOW_LEFT - FRAME04_WINDOW_WIDTH,
    height: FRAME04_WINDOW_HEIGHT,
    backgroundColor: FixedColors.frameSurfaceBlack,
  },
  frame04Window: {
    position: 'absolute',
    top: FRAME04_WINDOW_TOP,
    left: FRAME04_WINDOW_LEFT,
    width: FRAME04_WINDOW_WIDTH,
    height: FRAME04_WINDOW_HEIGHT,
    backgroundColor: FixedColors.frameWindowFill,
  },
  frame04Logo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: FRAME04_LOGO_WIDTH,
    height: STUDIO_FRAME_HEIGHT,
  },
  frame04Detail: {
    position: 'absolute',
    right: FRAME04_DETAIL_RIGHT,
    bottom: FRAME04_DETAIL_BOTTOM,
    fontFamily: FontFamily.sans,
    fontSize: FRAME04_DETAIL_FONT_SIZE,
    lineHeight: FRAME04_DETAIL_FONT_SIZE * LineHeightRatio.base,
    fontWeight: FontWeight.regular,
    color: FixedColors.frameCaptionMauve,
    textAlign: 'right',
  },
});
