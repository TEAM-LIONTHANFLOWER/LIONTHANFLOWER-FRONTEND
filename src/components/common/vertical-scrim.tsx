import type { StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/** 시안의 스크림이 가장 짙어지는 지점의 불투명도. `FixedColors.scrim` 과 같은 값입니다. */
const DEFAULT_MAX_OPACITY = 0.5;

/** 위쪽 끝. 검정의 알파만 0 이라 투명해지면서 색이 뜨지 않습니다. */
const TRANSPARENT_BLACK = 'rgba(0, 0, 0, 0)';

/** 위에서 아래로. `expo-linear-gradient` 의 기본값과 같지만 의도를 남겨 둡니다. */
const TOP = { x: 0.5, y: 0 } as const;
const BOTTOM = { x: 0.5, y: 1 } as const;

interface VerticalScrimProps {
  /** 가장 아래쪽 불투명도. 위쪽은 항상 완전 투명입니다. */
  maxOpacity?: number;
  /** 보통 `position: 'absolute'` 로 사진 위에 덮습니다. */
  style?: StyleProp<ViewStyle>;
}

/**
 * 위에서 아래로 투명 → 검정으로 어두워지는 그라데이션. 사진 위 흰 글씨의 가독성을 확보합니다.
 *
 * React Native 0.86 의 `experimental_backgroundImage` 는 react-native-web 이 아직 지원하지
 * 않아 웹에서 그라데이션이 사라집니다. 그래서 `expo-linear-gradient` 를 씁니다 —
 * iOS / Android 는 네이티브 그라데이션, 웹은 CSS `linear-gradient` 로 그려집니다.
 */
export function VerticalScrim({ maxOpacity = DEFAULT_MAX_OPACITY, style }: VerticalScrimProps) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[TRANSPARENT_BLACK, `rgba(0, 0, 0, ${maxOpacity})`]}
      start={TOP}
      end={BOTTOM}
      style={style}
    />
  );
}
