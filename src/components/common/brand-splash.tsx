import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { OrbitLogo } from '@components/common/orbit-logo';
import { ScreenContainer } from '@components/common/screen-container';
import { BrandColors, Spacing } from '@constants/theme';
import mcmSymbol from '@assets/images/splash/mcm-symbol.png';

/** 로고가 서서히 나타나는 시간 (ms) */
const FADE_IN_DURATION_MS = 700;
/** 로고가 다 나타난 뒤 머무는 시간 (ms) */
const HOLD_DURATION_MS = 800;

// 시안(393×852) 의 세로 배분입니다. 화면 크기가 달라도 비율이 유지되도록 flex 로 옮겼습니다.
/** 화면 위 ~ 로고 아래 */
const LOGO_SLOT_FLEX = 320;
/** 로고 아래 ~ 화면 끝 */
const SYMBOL_SLOT_FLEX = 532;

interface BrandSplashProps {
  /** 스플래시가 끝났을 때 호출됩니다. 보통 다음 화면으로 이동시킵니다. */
  onFinish: () => void;
}

/**
 * 고객·직원 공통 스플래시 화면.
 *
 * 진입점이 `/` 와 `/staff` 로 갈라져 있어 라우트가 아니라 컴포넌트로 두고,
 * 양쪽 진입 화면에서 각각 렌더한 뒤 `onFinish` 로 다음 목적지를 정합니다.
 */
export function BrandSplash({ onFinish }: BrandSplashProps) {
  // 렌더 중 ref 를 읽을 수 없어(react-hooks/refs) 지연 초기화 state 로 값을 한 번만 만듭니다.
  const [opacity] = useState(() => new Animated.Value(0));
  // onFinish 가 매 렌더 새로 만들어져도 타이머가 다시 시작되지 않도록 ref 로 붙잡아 둡니다.
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const animation = Animated.timing(opacity, {
      toValue: 1,
      duration: FADE_IN_DURATION_MS,
      useNativeDriver: true,
    });

    animation.start();
    const timer = setTimeout(() => {
      onFinishRef.current();
    }, FADE_IN_DURATION_MS + HOLD_DURATION_MS);

    return () => {
      animation.stop();
      clearTimeout(timer);
    };
  }, [opacity]);

  return (
    <ScreenContainer edgeToEdge backgroundColor={BrandColors.splashBackground} style={styles.stage}>
      <Animated.View style={[styles.fade, { opacity }]}>
        <View style={styles.logoSlot}>
          <OrbitLogo />
        </View>
        <View style={styles.symbolSlot}>
          <Image source={mcmSymbol} style={styles.symbol} contentFit="contain" accessible={false} />
        </View>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stage: {
    paddingVertical: 0,
    gap: 0,
  },
  fade: {
    flex: 1,
  },
  logoSlot: {
    flex: LOGO_SLOT_FLEX,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  symbolSlot: {
    flex: SYMBOL_SLOT_FLEX,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.three,
  },
  symbol: {
    width: 45,
    height: 41,
  },
});
