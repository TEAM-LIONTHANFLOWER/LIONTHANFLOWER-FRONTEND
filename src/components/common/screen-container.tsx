import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@constants/theme';
import { useThemeColors } from '@hooks/use-theme-colors';

type ScreenContainerProps = PropsWithChildren<{
  /** 좌우 기본 여백을 없애고 콘텐츠를 화면 끝까지 채웁니다. */
  edgeToEdge?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

/** 모든 화면의 최상위 래퍼. 안전 영역 / 배경색 / 최대 너비를 담당합니다. */
export function ScreenContainer({ children, edgeToEdge = false, style }: ScreenContainerProps) {
  const colors = useThemeColors();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.content, edgeToEdge && styles.edgeToEdge, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.three,
  },
  edgeToEdge: {
    maxWidth: undefined,
    paddingHorizontal: 0,
  },
});
