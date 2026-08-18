import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { FixedColors, Radius, Spacing } from '@constants/theme';

/** 지금 보고 있는 점이 알약으로 늘어나는 시간. */
const GROW_DURATION_MS = 260;

/**
 * 누를 수 있는 점의 터치 영역.
 * 점 높이가 8 이라 위아래로 18 씩 더해 44 를 채우고, 좌우는 점 사이 간격을 반씩 나눠 가집니다.
 * 여백으로 넓혀야 이웃한 점끼리 터치 영역이 겹치지 않습니다.
 */
const TOUCH_PADDING_Y = 18;
const TOUCH_PADDING_X = Spacing.one;

interface PageIndicatorProps {
  /** 전체 장 수 */
  count: number;
  /** 지금 보고 있는 장 번호 (0부터) */
  activeIndex: number;
  /**
   * 점을 눌러 그 장으로 옮길 수 있게 합니다.
   * 넘기지 않으면 읽어 주기만 하는 표시가 되고, 누르기는 그대로 아래로 내려갑니다.
   */
  onSelect?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
}

interface DotProps {
  isActive: boolean;
}

/** 점 하나. 지금 보고 있는 장이면 흰 알약으로 늘어납니다. */
function Dot({ isActive }: DotProps) {
  // 지연 초기화로 한 번만 만들고, 이후에는 애니메이션으로만 값을 바꿉니다.
  const grow = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    const animation = Animated.timing(grow, {
      toValue: isActive ? 1 : 0,
      duration: GROW_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      // 폭과 색이 함께 바뀌어야 해서 네이티브 드라이버를 쓰지 못합니다. 점 몇 개뿐이라 부담이 없습니다.
      useNativeDriver: false,
    });

    animation.start();
    return () => animation.stop();
  }, [grow, isActive]);

  const width = grow.interpolate({ inputRange: [0, 1], outputRange: [Spacing.two, Spacing.four] });
  const backgroundColor = grow.interpolate({
    inputRange: [0, 1],
    outputRange: [FixedColors.indicatorInactive, FixedColors.onDark],
  });

  return <Animated.View style={[styles.dot, { width, backgroundColor }]} />;
}

/**
 * 여러 장을 넘겨 보는 화면의 페이지 표시. 지금 보고 있는 장만 알약 모양으로 길어집니다.
 * 온보딩 슬라이드와 Arc 봉투 캐러셀이 같은 표시를 씁니다.
 */
export function PageIndicator({ count, activeIndex, onSelect, style }: PageIndicatorProps) {
  const label = `전체 ${count}장 중 ${activeIndex + 1}번째`;
  const indexes = Array.from({ length: count }, (_, index) => index);

  if (onSelect === undefined) {
    return (
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        style={[styles.row, styles.rowStatic, style]}
      >
        {indexes.map((index) => (
          <Dot key={index} isActive={index === activeIndex} />
        ))}
      </View>
    );
  }

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      style={[styles.rowTouchable, style]}
    >
      {indexes.map((index) => (
        <Pressable
          key={index}
          accessibilityRole="tab"
          accessibilityLabel={`${index + 1}번째`}
          accessibilityState={{ selected: index === activeIndex }}
          onPress={() => onSelect(index)}
          style={styles.touchTarget}
        >
          <Dot isActive={index === activeIndex} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  // 읽어 주기만 하는 표시라, 누르기가 그대로 아래로 내려가게 둡니다.
  rowStatic: {
    pointerEvents: 'none',
  },
  // 터치 영역이 이미 좌우 여백을 들고 있어서 줄에는 간격을 따로 주지 않습니다.
  rowTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchTarget: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: TOUCH_PADDING_Y,
    paddingHorizontal: TOUCH_PADDING_X,
  },
  dot: {
    height: Spacing.two,
    borderRadius: Radius.pill,
  },
});
