import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

/** 그라데이션을 나눌 기본 단계 수. 클수록 부드럽지만 View 가 늘어납니다. */
const DEFAULT_STEPS = 24;
/** 시안의 스크림이 가장 짙어지는 지점의 불투명도 */
const DEFAULT_MAX_OPACITY = 0.5;

interface VerticalScrimProps {
  /** 가장 아래쪽 불투명도. 위쪽은 항상 완전 투명입니다. */
  maxOpacity?: number;
  /** 그라데이션을 나눌 단계 수 */
  steps?: number;
  /** 보통 `position: 'absolute'` 로 사진 위에 덮습니다. */
  style?: StyleProp<ViewStyle>;
}

/**
 * 위에서 아래로 투명 → 검정으로 어두워지는 그라데이션. 사진 위 흰 글씨의 가독성을 확보합니다.
 *
 * `expo-linear-gradient` 는 이 프로젝트에 설치되어 있지 않고,
 * React Native 0.86 의 `experimental_backgroundImage` 는 react-native-web 이 아직 지원하지
 * 않아 웹에서 그라데이션이 사라집니다. 그래서 얇은 View 를 겹쳐 그라데이션을 만듭니다 —
 * 의존성 추가 없이 iOS / Android / 웹에서 똑같이 그려집니다.
 */
export function VerticalScrim({
  maxOpacity = DEFAULT_MAX_OPACITY,
  steps = DEFAULT_STEPS,
  style,
}: VerticalScrimProps) {
  // 각 밴드는 자기 구간의 가운데 값을 쓰면 위아래 경계가 덜 눈에 띕니다.
  const bands = Array.from(
    { length: steps },
    (_, index) => `rgba(0, 0, 0, ${((maxOpacity * (index + 0.5)) / steps).toFixed(4)})`
  );

  return (
    <View pointerEvents="none" style={style}>
      {bands.map((backgroundColor) => (
        <View key={backgroundColor} style={[styles.band, { backgroundColor }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    flex: 1,
  },
});
