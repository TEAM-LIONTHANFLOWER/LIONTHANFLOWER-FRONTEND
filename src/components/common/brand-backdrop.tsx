import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { FixedColors } from '@constants/theme';
import light from '@assets/images/common/light.png';

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
 * 화면에 들어올 때 조명이 켜지는 시간.
 * 배경이 단색이라 빛만 천천히 밝아져도 화면이 열리는 느낌이 납니다.
 */
const LIGHT_FADE_DURATION_MS = 900;

/** 켜지는 동안 빛줄기가 살짝 퍼집니다. */
const LIGHT_SCALE_FROM = 1.08;

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface BrandBackdropProps {
  /**
   * 우상단에서 쏟아지는 금빛 조명을 함께 켭니다.
   *
   * 기본은 꺼져 있습니다 — 조명은 앱에 들어와 처음 만나는 홈 화면의 인사말이라,
   * 뒤따르는 화면까지 계속 켜 두면 그 자리에서만 갖는 뜻이 옅어집니다.
   * 지금은 홈(`/home`) 한 곳만 켭니다.
   */
  showLight?: boolean;
}

/**
 * 홈·Arc 계열 화면이 공유하는 배경.
 * 시안의 모든 브랜드 화면과 같은 검정 단색입니다. 홈만 그 위에 금빛 조명을 얹습니다.
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
export function BrandBackdrop({ showLight = false }: BrandBackdropProps) {
  // 지연 초기화로 한 번만 만들고, 이후에는 애니메이션으로만 값을 바꿉니다.
  const [glow] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!showLight) {
      return;
    }

    const animation = Animated.timing(glow, {
      toValue: 1,
      duration: LIGHT_FADE_DURATION_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [glow, showLight]);

  const scale = glow.interpolate({ inputRange: [0, 1], outputRange: [LIGHT_SCALE_FROM, 1] });

  return (
    <View style={[StyleSheet.absoluteFill, styles.backdrop]}>
      {showLight ? (
        <AnimatedImage
          source={light}
          style={[styles.light, { opacity: glow, transform: [{ scale }] }]}
          contentFit="contain"
          accessible={false}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // 화면 전체를 덮는 배경이라, 누르기가 그대로 위의 내용까지 내려가게 둡니다.
  backdrop: {
    backgroundColor: FixedColors.brandBackdrop,
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
