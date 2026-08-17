import { StyleSheet, type ImageStyle, type StyleProp } from 'react-native';
import { Image } from 'expo-image';

import mcmWordmark from '@assets/images/home/mcm-wordmark.png';

/**
 * 시안이 정한 워드마크 크기.
 * 홈 머리말과 매칭 화면의 전환 애니메이션이 같은 값을 봐야 로고가 정확히 제자리에 앉습니다.
 */
export const WORDMARK_WIDTH = 92;
export const WORDMARK_HEIGHT = 84;

interface BrandWordmarkProps {
  style?: StyleProp<ImageStyle>;
}

/** MCM 워드마크. 홈 계열 화면의 머리말과 매칭 화면의 전환에서 함께 씁니다. */
export function BrandWordmark({ style }: BrandWordmarkProps) {
  return (
    <Image
      source={mcmWordmark}
      style={[styles.wordmark, style]}
      contentFit="contain"
      accessibilityLabel="MCM"
    />
  );
}

const styles = StyleSheet.create({
  wordmark: {
    width: WORDMARK_WIDTH,
    height: WORDMARK_HEIGHT,
  },
});
