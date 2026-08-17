/**
 * Home / Arc / Studio 를 오가는 하단 내비게이션 바.
 *
 * 시안은 Figma `GLASS` 이펙트 위에 아이콘·라벨을 얹은 알약 모양입니다. 선택 표시는
 * 아이콘·라벨과 분리된 캡슐 하나가 전담하고, 그 캡슐은 탭이 바뀔 때 애니메이션으로 움직입니다.
 *
 * 웹에서 `backdrop-filter`(유리 블러 효과)가 부모의 `overflow: hidden` 클리핑을
 * 무시하는 버그가 있어, 여러 군데서 그 우회 처리를 하고 있습니다. 아래쪽에 비슷하게 생긴
 * `borderRadius`/`overflow: hidden` 이 중복돼 보이는 곳이 있다면 대부분 이것 때문입니다.
 * 지우면 웹에서만 캡슐이 각진 사각형으로 보이게 됩니다.
 */
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import type { NavTabId } from '@/types/navigation';
import { NAV_TABS } from '@constants/navigation';
import { FixedColors, Radius, Spacing, Typography } from '@constants/theme';

/** 시안 프레임 크기. */
const BAR_WIDTH = 260;
const BAR_HEIGHT = 71;

/** 선택된 탭 캡슐 크기 */
const TAB_CAPSULE_WIDTH = 70;
const TAB_CAPSULE_HEIGHT = 50;
/** 세로 위치는 항상 같아 상수로 미리 계산해 둡니다. */
const CAPSULE_TOP = (BAR_HEIGHT - TAB_CAPSULE_HEIGHT) / 2;

/** 탭 줄 좌우 여백 */
const TABS_INSET = Spacing.two;

/**
 * 캡슐이 도착지로 움직이기 전, 반대 방향으로 살짝 당겨지는 예비 동작 거리.
 * 오른쪽으로 이동할 땐 먼저 왼쪽으로, 왼쪽으로 이동할 땐 먼저 오른쪽으로 당깁니다.
 */
const ANTICIPATION_OFFSET = Spacing.two;
const ANTICIPATION_DURATION_MS = 160;
const MOVE_DURATION_MS = 420;

/** 배경 흐림 세기. `ExploreButton` 과 같은 값. */
const GLASS_BLUR_INTENSITY = 45;

/** 가장자리에 걸리는 빛의 두께. */
const EDGE_WIDTH = 1;

/** `GLASS` 이펙트의 광원각 −45°. 빛이 좌상단에서 우하단으로 흐릅니다. */
const LIGHT_START = { x: 0, y: 0 } as const;
const LIGHT_END = { x: 1, y: 1 } as const;

/** 광원 쪽이 가장 밝고, 옆면에서 죽었다가, 반대쪽 모서리에서 되비칩니다. */
const EDGE_COLORS = [
  FixedColors.glassEdgeLit,
  FixedColors.glassEdgeShade,
  FixedColors.glassEdgeBounce,
] as const;
const EDGE_STOPS = [0, 0.5, 1] as const;

/**
 * 캡슐은 유리 블러(`backdrop-filter`) 위에서 `translateX` 로 움직입니다.
 *
 * 그런데 크롬(웹)은 `translateX` 로 움직이는 조상 안에 블러가 있으면, 그 블러가 캡슐의
 * 둥근 모서리(`border-radius`)를 무시하고 사각형 그대로 삐져나오는 버그가 있습니다.
 *
 * 그래서 웹에서만 `transform` 대신 `left` 로 캡슐을 옮겨서 이 버그를 피합니다.
 */
const ANIMATE_CAPSULE_WITH_TRANSFORM = Platform.OS !== 'web';

// 네이티브 Liquid Glass 가능 여부는 실행 중에 바뀌지 않아 모듈을 읽을 때 한 번만 확인합니다.
const HAS_LIQUID_GLASS = isLiquidGlassAvailable();

interface GlassSurfaceProps extends PropsWithChildren {
  style: StyleProp<ViewStyle>;
  /** 유리 위에 얹는 색. 캡슐에만 씁니다. */
  tintColor?: string;
  /** 굴절 가장자리 빛 테두리. 바 전체에만 씁니다. */
  withEdgeGlow?: boolean;
}

/**
 * Figma `GLASS` 이펙트 하나를 그리는 공통 표면.
 *
 * - iOS 26+ : `GlassView` 로 시스템 Liquid Glass.
 * - 그 외   : `BlurView` 로 배경을 흐리고, `withEdgeGlow` 면 굴절 가장자리 빛을
 *             그라데이션 테두리로, `tintColor` 가 있으면 그 위에 반투명 색을 덧씌웁니다.
 */
function GlassSurface({ style, tintColor, withEdgeGlow, children }: GlassSurfaceProps) {
  if (HAS_LIQUID_GLASS) {
    return (
      <GlassView glassEffectStyle="clear" tintColor={tintColor} style={style}>
        {children}
      </GlassView>
    );
  }

  const blur = (
    <BlurView
      intensity={GLASS_BLUR_INTENSITY}
      tint="default"
      // Android 는 기본값이 흐림 없음이라 명시적으로 켜야 합니다.
      experimentalBlurMethod="dimezisBlurView"
      style={withEdgeGlow ? styles.inner : style}
    >
      {tintColor ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: tintColor }]} />
      ) : null}
      {children}
    </BlurView>
  );

  if (!withEdgeGlow) {
    return blur;
  }

  return (
    <LinearGradient
      colors={EDGE_COLORS}
      locations={EDGE_STOPS}
      start={LIGHT_START}
      end={LIGHT_END}
      style={[style, styles.edge]}
    >
      {blur}
    </LinearGradient>
  );
}

interface BottomNavBarProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Home / Arc / Studio 를 오가는 하단 내비게이션.
 * 아이콘·라벨(`tab`)은 선택된 탭이든 아니든 항상 똑같은 스타일로 그립니다.
 * 탭 선택 표시는 그 위에 따로 얹는 캡슐 하나가 전담합니다.
 */
export function BottomNavBar({ activeTab, onTabChange, style }: BottomNavBarProps) {
  // 캡슐 위치는 실제 렌더 폭을 측정해서 계산합니다. 측정 전에는 시안 폭을 기본값으로 씁니다.
  const [barWidth, setBarWidth] = useState(BAR_WIDTH);

  const activeIndex = NAV_TABS.findIndex((tab) => tab.id === activeTab);
  // `tabs` 좌우에 `TABS_INSET` 만큼 여백이 있어, 칼럼 폭은 그만큼 뺀 너비를 기준으로 계산합니다.
  const columnWidth = (barWidth - TABS_INSET * 2) / NAV_TABS.length;
  const capsuleLeft =
    TABS_INSET + columnWidth * activeIndex + (columnWidth - TAB_CAPSULE_WIDTH) / 2;

  // 지연 초기화로 한 번만 만들고, 이후에는 애니메이션으로만 값을 바꿉니다.
  const [capsuleX] = useState(() => new Animated.Value(capsuleLeft));
  const previousIndexRef = useRef(activeIndex);
  const previousLeftRef = useRef(capsuleLeft);

  useEffect(() => {
    const previousIndex = previousIndexRef.current;
    const previousLeft = previousLeftRef.current;
    previousIndexRef.current = activeIndex;
    previousLeftRef.current = capsuleLeft;

    if (previousIndex === activeIndex) {
      // 탭은 그대로고 바 폭만 바뀐 경우(반응형)엔 예비 동작 없이 바로 옮깁니다.
      Animated.timing(capsuleX, {
        toValue: capsuleLeft,
        duration: MOVE_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: ANIMATE_CAPSULE_WITH_TRANSFORM,
      }).start();
      return;
    }

    const movingRight = activeIndex > previousIndex;
    const anticipationLeft =
      previousLeft + (movingRight ? -ANTICIPATION_OFFSET : ANTICIPATION_OFFSET);

    Animated.sequence([
      Animated.timing(capsuleX, {
        toValue: anticipationLeft,
        duration: ANTICIPATION_DURATION_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: ANIMATE_CAPSULE_WITH_TRANSFORM,
      }),
      Animated.timing(capsuleX, {
        toValue: capsuleLeft,
        duration: MOVE_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: ANIMATE_CAPSULE_WITH_TRANSFORM,
      }),
    ]).start();
  }, [activeIndex, capsuleLeft, capsuleX]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  return (
    <View accessibilityRole="tablist" style={[styles.wrapper, style]}>
      <GlassSurface style={styles.surface} withEdgeGlow>
        <View style={styles.tabs} onLayout={handleLayout}>
          <Animated.View
            style={[
              styles.capsule,
              ANIMATE_CAPSULE_WITH_TRANSFORM
                ? { transform: [{ translateX: capsuleX }] }
                : { left: capsuleX },
            ]}
          >
            <GlassSurface style={styles.capsuleSurface} tintColor={FixedColors.navTabSelected} />
          </Animated.View>

          {NAV_TABS.map((tab) => (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: tab.id === activeTab }}
              onPress={() => onTabChange(tab.id)}
              style={styles.tab}
            >
              <Image
                source={tab.icon}
                style={styles.icon}
                contentFit="contain"
                accessible={false}
              />
              <Text style={styles.label}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  // 좁은 화면에서도 고정 크기가 넘치지 않도록 최대 폭을 함께 둡니다.
  wrapper: {
    width: BAR_WIDTH,
    maxWidth: '100%',
    alignSelf: 'center',
  },
  surface: {
    width: '100%',
    height: BAR_HEIGHT,
    borderRadius: Radius.pill,
    overflow: 'hidden',
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
  tabs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: TABS_INSET,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 레이아웃에 참여하지 않는 절대 위치 배경이라, 아이콘·라벨의 위치 계산과 완전히 분리됩니다.
  // `left` 는 0 에 고정해 두고(웹만 애니메이션으로 덮어씀), 그 외엔 `translateX` 로 옮깁니다.
  capsule: {
    position: 'absolute',
    left: 0,
    top: CAPSULE_TOP,
    width: TAB_CAPSULE_WIDTH,
    height: TAB_CAPSULE_HEIGHT,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  // 웹에서는 `BlurView` 의 `backdrop-filter` 가 부모의 `overflow: hidden` 을 따라가지 않고
  // 사각형 그대로 새어나와서, 여기에도 같은 라운드·클리핑을 한 번 더 줍니다.
  capsuleSurface: {
    flex: 1,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    ...Typography.bodyKo13,
    color: FixedColors.onDark,
  },
});
