import { StyleSheet, type ImageStyle, type StyleProp } from 'react-native';
import { Image } from 'expo-image';

import mcmOrbitLogo from '@assets/images/splash/mcm-orbit-logo.svg';

/** 시안이 정한 락업 크기. */
export const ORBIT_LOGO_WIDTH = 109.25;
export const ORBIT_LOGO_HEIGHT = 64.5;

interface OrbitLogoProps {
  style?: StyleProp<ImageStyle>;
}

/**
 * MCM Orbit 워드마크 락업.
 * 스플래시·정보 입력·매칭 대기 화면이 시안에서 모두 같은 크기(109.25×64.5)로 씁니다.
 */
export function OrbitLogo({ style }: OrbitLogoProps) {
  return (
    <Image
      source={mcmOrbitLogo}
      style={[styles.logo, style]}
      contentFit="contain"
      accessibilityLabel="MCM Orbit"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: ORBIT_LOGO_WIDTH,
    height: ORBIT_LOGO_HEIGHT,
  },
});
