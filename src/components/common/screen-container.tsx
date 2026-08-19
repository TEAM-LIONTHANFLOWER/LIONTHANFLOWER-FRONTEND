import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@constants/theme';
import { useThemeColors } from '@hooks/use-theme-colors';

type ScreenContainerProps = PropsWithChildren<{
  /** 좌우 기본 여백을 없애고 콘텐츠를 화면 끝까지 채웁니다. */
  edgeToEdge?: boolean;
  /**
   * 배경색을 테마 대신 직접 지정합니다.
   * 스플래시·온보딩처럼 색상 스킴과 무관하게 배경이 고정된 화면, 또는
   * 뒤에 깔린 사진을 그대로 보여줘야 하는 화면(`transparent`)에서 씁니다.
   * 생략하면 현재 테마의 배경색을 씁니다.
   */
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}>;

/**
 * 모든 화면의 최상위 래퍼. 안전 영역 / 배경색 / 최대 너비를 담당합니다.
 *
 * 안쪽 `SafeAreaView` 는 네 방향 모두에 패딩을 넣습니다.
 * `edgeToEdge` 는 `maxWidth` 와 좌우 패딩만 없앨 뿐 세로 안전 영역은 그대로 남습니다.
 *
 * **배경이 안전 영역을 넘어야 하는 화면은 배경 레이어를 이 컴포넌트 바깥에 둡니다.**
 *
 * 사진을 깔고 그 위에 글을 얹는 화면 — `(customer)/matching.tsx` 와
 * `common/onboarding-slide.tsx` — 이 여기 해당합니다. 배경을 children 으로 넣으면
 * `StyleSheet.absoluteFill` 이 안전 영역 안쪽에 갇혀, 노치와 홈 인디케이터 자리에
 * 배경색 띠가 생깁니다. 웹은 `mobile-frame.web.tsx` 가 상단 59 / 하단 34 를 고정으로
 * 넣기 때문에 특히 두드러집니다.
 *
 * 그래서 그런 화면은 배경과 스크림을 바깥 `View` 에 깔고, 이 컴포넌트로는 콘텐츠만 감쌉니다.
 * 온보딩이 라우트가 아니라 슬라이드 단위로 감싸는 것도 같은 이유입니다 — 슬라이드마다
 * 배경 사진이 다르고, 각 슬라이드가 그 자체로 전체 화면이라 안전 영역도 슬라이드마다 필요합니다.
 * 이때 슬라이드들은 가로 스크롤의 형제라서 `SafeAreaView` 가 중첩되지는 않습니다.
 */
export function ScreenContainer({
  children,
  edgeToEdge = false,
  backgroundColor,
  style,
}: ScreenContainerProps) {
  const colors = useThemeColors();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: backgroundColor ?? colors.background }]}
    >
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
