import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';

import { FixedColors, FontFamily, Radius } from '@constants/theme';

/** 시안 프레임 크기 (Figma `736:356`). */
const BUTTON_WIDTH = 126;
const BUTTON_HEIGHT = 58;

/**
 * 배경 흐림 세기. 시안의 유리는 안쪽에 배경 형태가 남을 만큼 투명하면서 살짝 밝아집니다.
 *
 * `intensity` 하나가 흐림과 그 위에 깔리는 흰 면을 함께 정합니다. 둘을 따로 줄 수 없어서,
 * 흐림이 실제로 걸리는지에 따라 값을 다르게 잡습니다.
 *
 * - iOS: 네이티브 흐림이 걸리므로 흰 면까지 더해져 유리가 됩니다.
 * - Android: 아래 설명대로 흐림을 걸 수 없어 흰 면만 남습니다. 여기에 45 를 주면
 *   흐려지지도 않은 채 흰 면 19.6% 만 덮여 뿌옇기만 합니다. 그래서 면은 겨우 비칠
 *   만큼만 남기고, 알약 모양은 가장자리 빛으로 읽히게 둡니다.
 *
 * 웹은 `expo-blur` 로 맑은 유리를 만들 수 없어 `explore-button.web.tsx` 로 나눠 두었습니다.
 */
const GLASS_BLUR_INTENSITY = Platform.select({ android: 18, default: 45 });

/** 가장자리에 걸리는 빛의 두께. */
const EDGE_WIDTH = 1;

/**
 * 시안 `GLASS` 이펙트의 광원각 −45°. 빛이 좌상단에서 우하단으로 흐릅니다.
 * 웹의 CSS 그라데이션은 시작·끝 좌표를 못 받고 각도만 가져가는데, 어차피 각도가 전부입니다.
 */
const LIGHT_START = { x: 0, y: 0 } as const;
const LIGHT_END = { x: 1, y: 1 } as const;

/** 광원 쪽이 가장 밝고, 옆면에서 죽었다가, 반대쪽 모서리에서 되비칩니다. */
const EDGE_COLORS = [
  FixedColors.glassEdgeLit,
  FixedColors.glassEdgeShade,
  FixedColors.glassEdgeBounce,
] as const;
const EDGE_STOPS = [0, 0.5, 1] as const;

interface ExploreButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

// 네이티브 Liquid Glass 가능 여부는 실행 중에 바뀌지 않아 모듈을 읽을 때 한 번만 확인합니다.
const HAS_LIQUID_GLASS = isLiquidGlassAvailable();

/**
 * 온보딩의 Explore 버튼.
 *
 * 시안은 면도 테두리도 없이 Figma 의 `GLASS` 이펙트(굴절 0.8 · 분산 0.5 · 광원각 −45°)만으로
 * 그려져 있습니다. 뒤에 있는 사진을 굴절시키는 배경 효과라 이미지로 추출할 수 없어 —
 * 추출하면 글자만 남습니다 — 플랫폼별로 가장 가까운 방식을 각각 씁니다.
 *
 * - iOS 26+ : `GlassView` 로 시스템 Liquid Glass. 굴절까지 살아 있어 시안과 가장 가깝습니다.
 * - 그 외   : `BlurView` 로 배경을 흐리고 밝힌 다음, 굴절로 생기는 가장자리 빛을
 *             그라데이션 테두리로 대신합니다. 알약 테두리에 그라데이션을 직접 칠할 수는 없어서,
 *             그라데이션 면을 깔고 1px 안쪽에 흐림을 덮어 테두리만 남깁니다.
 *
 * **Android 에서는 `BlurView` 에 `experimentalBlurMethod` 를 주지 않습니다.**
 * 그 옵션을 켜면 `expo-blur` 가 Dimezis BlurView 로 넘어가는데, 이 구현은 흐릴 배경을
 * 만들려고 뒤에 있는 뷰 트리를 **소프트웨어 Canvas** 에 다시 그립니다. 이 버튼 뒤에는
 * 온보딩 사진이 깔려 있어서, `expo-image` 가 그 사진을 하드웨어 비트맵으로 올린 기기에서는
 * `Software rendering doesn't support hardware bitmaps` 로 앱이 죽습니다.
 * 기기·안드로이드 버전·남은 메모리에 따라 갈려서 어떤 폰에서만 재현됩니다.
 * 같은 이유로 `customer/bottom-nav-bar` 도 흐림을 끄고 있습니다.
 *
 * 그래서 Android 는 흐림 없이 `tint` 만 반투명 면으로 깔립니다(기본값 `none`).
 */
export function ExploreButton({ onPress, style }: ExploreButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="둘러보기"
      onPress={onPress}
      style={style}
    >
      {HAS_LIQUID_GLASS ? (
        <GlassView glassEffectStyle="clear" style={[styles.surface, styles.center]}>
          <Text style={styles.label}>Explore</Text>
        </GlassView>
      ) : (
        <LinearGradient
          colors={EDGE_COLORS}
          locations={EDGE_STOPS}
          start={LIGHT_START}
          end={LIGHT_END}
          style={[styles.surface, styles.edge]}
        >
          <BlurView
            intensity={GLASS_BLUR_INTENSITY}
            tint="default"
            // `experimentalBlurMethod` 는 주지 않습니다. 자세한 이유는 파일 맨 위 설명을 참고하세요.
            style={[styles.inner, styles.center]}
          >
            <Text style={styles.label}>Explore</Text>
          </BlurView>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  surface: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 이 여백만큼만 그라데이션이 드러나 테두리가 됩니다.
  edge: {
    padding: EDGE_WIDTH,
  },
  inner: {
    flex: 1,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  label: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 20,
    lineHeight: 26,
    color: FixedColors.onDark,
  },
});
