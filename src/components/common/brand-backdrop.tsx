import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { FixedColors } from '@constants/theme';
import light from '@assets/images/common/light.png';

/** 좌상단에서 우하단으로 흐르는 대각선 그라데이션. */
const TOP_LEFT = { x: 0, y: 0 } as const;
const BOTTOM_RIGHT = { x: 1, y: 1 } as const;

/** 조명 그림 크기. 원본 PNG 를 확대·축소 없이 그대로 씁니다. */
const LIGHT_SIZE = 387;

/**
 * 그림 안에서 빛이 실제로 그려진 영역의 위쪽 끝과 좌우 한가운데입니다.
 * 캔버스 가장자리는 투명하게 비어 있어, 그림을 그대로 앉히면 빛이 그만큼 아래로 밀립니다.
 * 화면에 붙일 때는 캔버스가 아니라 이 값을 기준으로 잡습니다.
 */
const LIGHT_CONTENT_TOP = 99;
const LIGHT_CONTENT_CENTER_X = 193;

/** 시안(393 폭)에서 빛줄기 한가운데는 화면 가운데보다 80 오른쪽에 있습니다. */
const LIGHT_CENTER_X_OFFSET = 80;

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
 * 조명은 블러 처리된 그림입니다. React Native 에는 도형에 블러를 먹이는
 * 방법이 플랫폼마다 제각각이라, 시안의 도형과 블러를 그대로 구운 PNG 를 씁니다.
 */
export function BrandBackdrop() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.backdrop]}>
      <LinearGradient
        colors={[FixedColors.brandBackdropStart, FixedColors.brandBackdropEnd]}
        start={TOP_LEFT}
        end={BOTTOM_RIGHT}
        style={StyleSheet.absoluteFill}
      />
      <Image source={light} style={styles.light} contentFit="contain" accessible={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  // 화면 전체를 덮는 배경이라, 누르기가 그대로 위의 내용까지 내려가게 둡니다.
  backdrop: {
    pointerEvents: 'none',
  },
  // 빛의 위쪽 끝이 화면 맨 위에 닿도록, 그림에서 비어 있는 위쪽 여백만큼 끌어올립니다.
  // 안전 영역보다 위에 있어서 노치 자리까지 빛이 이어집니다.
  light: {
    position: 'absolute',
    width: LIGHT_SIZE,
    height: LIGHT_SIZE,
    top: -LIGHT_CONTENT_TOP,
    left: '50%',
    marginLeft: LIGHT_CENTER_X_OFFSET - LIGHT_CONTENT_CENTER_X,
  },
});
