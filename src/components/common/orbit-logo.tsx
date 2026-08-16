import { StyleSheet, type ImageStyle, type StyleProp } from 'react-native';
import { Image } from 'expo-image';

import mcmOrbitLogo from '@assets/images/splash/mcm-orbit-logo.png';

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
    width: 109.25,
    height: 64.5,
  },
});
