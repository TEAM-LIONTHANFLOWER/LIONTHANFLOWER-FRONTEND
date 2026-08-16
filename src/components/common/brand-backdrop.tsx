import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { FixedColors } from '@constants/theme';
import spotlight from '@assets/images/home/spotlight.png';

/** 좌상단에서 우하단으로 흐르는 대각선 그라데이션. */
const TOP_LEFT = { x: 0, y: 0 } as const;
const BOTTOM_RIGHT = { x: 1, y: 1 } as const;

/**
 * 스포트라이트 그림 크기.
 * 시안의 발광체는 한 변 131.9 인 정사각형을 45도 돌린 것(대각선 186.6)이고,
 * 여기에 블러가 사방으로 50 씩 번져 288 이 됩니다.
 */
const SPOTLIGHT_SIZE = 288;
/** 시안(393 폭)에서 발광체 중심은 화면 가운데보다 80 오른쪽에 있습니다. */
const SPOTLIGHT_CENTER_X_OFFSET = 80;
/** 발광체가 화면 위쪽에 반쯤 걸쳐 있어 중심이 화면 안 93 지점에 옵니다. */
const SPOTLIGHT_CENTER_Y = 93;

/**
 * 홈 계열 화면이 공유하는 배경.
 * 검정에서 코냑으로 흐르는 대각선 그라데이션 위에, 우상단에서 쏟아지는 금빛을 얹습니다.
 *
 * **`ScreenContainer` 바깥에 둡니다.** 안에 넣으면 안전 영역 안쪽에 갇혀
 * 노치와 홈 인디케이터 자리에 색이 끊깁니다. 자세한 이유는 `screen-container.tsx` 참고.
 *
 * 색상 스킴을 따르지 않습니다. 스플래시·온보딩과 마찬가지로 배경이 고정된 화면이라
 * 색을 `FixedColors` 에서 가져옵니다.
 *
 * 스포트라이트는 블러 처리된 그림입니다. React Native 에는 도형에 블러를 먹이는
 * 방법이 플랫폼마다 제각각이라, 시안의 도형과 블러를 그대로 구운 PNG 를 씁니다.
 */
export function BrandBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[FixedColors.brandBackdropStart, FixedColors.brandBackdropEnd]}
        start={TOP_LEFT}
        end={BOTTOM_RIGHT}
        style={StyleSheet.absoluteFill}
      />
      <Image source={spotlight} style={styles.spotlight} contentFit="contain" accessible={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  // 중심 좌표를 맞춰야 해서 그림 크기의 절반씩 당겨 놓습니다.
  spotlight: {
    position: 'absolute',
    width: SPOTLIGHT_SIZE,
    height: SPOTLIGHT_SIZE,
    top: SPOTLIGHT_CENTER_Y - SPOTLIGHT_SIZE / 2,
    left: '50%',
    marginLeft: SPOTLIGHT_CENTER_X_OFFSET - SPOTLIGHT_SIZE / 2,
  },
});
