import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { FixedColors, FontFamily, Radius } from '@constants/theme';

/** 시안 프레임 크기 (Figma `736:356`). */
const BUTTON_WIDTH = 126;
const BUTTON_HEIGHT = 58;

/**
 * 유리 뒤가 흐려지는 정도와, 그 너머로 색이 살아나는 정도.
 *
 * 웹에서는 `expo-blur` 를 쓰지 않고 CSS `backdrop-filter` 를 직접 깝니다.
 * `BlurView` 는 `intensity` 하나로 흐림과 그 위에 깔리는 흰 면을 함께 정하는데,
 * 흐림을 세게 하면 흰 면도 같이 짙어집니다 — 45 면 흐림 9px 에 흰 면 13.5% 라
 * 유리가 아니라 안개가 됩니다. 여기서는 흐림만 세게 주고 면은 `glassFilm` 만큼만
 * 얹어서, 시안처럼 뒤 사진이 비쳐 보이는 맑은 유리를 만듭니다.
 */
const BLUR_RADIUS = 12;
const SATURATE = 180;
const BACKDROP_FILTER = `saturate(${SATURATE}%) blur(${BLUR_RADIUS}px)`;

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

/**
 * `backdrop-filter` 는 React Native 의 `ViewStyle` 에 없는 CSS 속성입니다.
 * `react-native-web` 은 모르는 속성을 걸러내지 않고 그대로 CSS 로 흘려보내므로,
 * 타입만 넓혀서 넘기면 그대로 걸립니다. 사파리는 아직 접두사 붙은 이름도 함께 봐야 합니다.
 */
interface GlassSurfaceStyle extends ViewStyle {
  backdropFilter?: string;
  WebkitBackdropFilter?: string;
}

/**
 * 온보딩의 Explore 버튼 — 웹 전용.
 *
 * 시안은 면도 테두리도 없이 Figma 의 `GLASS` 이펙트(굴절 0.8 · 분산 0.5 · 광원각 −45°)만으로
 * 그려져 있습니다. 네이티브(`explore-button.tsx`)는 iOS 26+ 에서 시스템 Liquid Glass 를 쓰고
 * 그 밖에서는 `expo-blur` 로 대신하는데, 웹에서는 `expo-blur` 가 흐림과 흰 면을 한 값으로
 * 묶어 두어 맑은 유리를 만들 수 없습니다. 그래서 웹만 파일을 나눠 `backdrop-filter` 를
 * 직접 씁니다.
 *
 * 굴절로 생기는 가장자리 빛은 네이티브 쪽과 같은 방식으로 대신합니다 — 알약 테두리에
 * 그라데이션을 직접 칠할 수는 없어서, 그라데이션 면을 깔고 1px 안쪽에 유리를 덮어
 * 테두리만 남깁니다.
 */
export function ExploreButton({ onPress, style }: ExploreButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="둘러보기"
      onPress={onPress}
      style={style}
    >
      <LinearGradient
        colors={EDGE_COLORS}
        locations={EDGE_STOPS}
        start={LIGHT_START}
        end={LIGHT_END}
        style={[styles.surface, styles.edge]}
      >
        <View style={[styles.inner, styles.center, glassSurface]}>
          <Text style={styles.label}>Explore</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/** `StyleSheet.create` 는 `ViewStyle` 만 받아서, 넓힌 타입은 밖에서 따로 만듭니다. */
const glassSurface: GlassSurfaceStyle = {
  backgroundColor: FixedColors.glassFilm,
  backdropFilter: BACKDROP_FILTER,
  WebkitBackdropFilter: BACKDROP_FILTER,
};

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
