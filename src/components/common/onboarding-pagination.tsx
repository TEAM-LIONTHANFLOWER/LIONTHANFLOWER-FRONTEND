import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { FixedColors, Radius, Spacing } from '@constants/theme';

interface OnboardingPaginationProps {
  /** 전체 슬라이드 수 */
  count: number;
  /** 현재 보고 있는 슬라이드 번호 (0부터) */
  activeIndex: number;
  style?: StyleProp<ViewStyle>;
}

/** 온보딩 상단의 페이지 인디케이터. 현재 페이지만 알약 모양으로 길어집니다. */
export function OnboardingPagination({ count, activeIndex, style }: OnboardingPaginationProps) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`전체 ${count}장 중 ${activeIndex + 1}번째`}
      style={[styles.row, style]}
    >
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[styles.dot, index === activeIndex ? styles.dotActive : styles.dotInactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // 읽어 주기만 하는 표시라, 누르기가 그대로 아래로 내려가게 둡니다.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    pointerEvents: 'none',
  },
  dot: {
    height: Spacing.two,
    borderRadius: Radius.pill,
  },
  dotActive: {
    width: Spacing.four,
    backgroundColor: FixedColors.onDark,
  },
  dotInactive: {
    width: Spacing.two,
    backgroundColor: FixedColors.indicatorInactive,
  },
});
