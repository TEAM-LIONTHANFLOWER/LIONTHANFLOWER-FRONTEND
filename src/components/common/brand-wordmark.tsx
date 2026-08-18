import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import mcmWordmark from '@assets/images/home/mcm-wordmark.png';

/**
 * 시안이 정한 워드마크 크기.
 * 홈 머리말과 매칭 화면의 전환 애니메이션이 같은 값을 봐야 로고가 정확히 제자리에 앉습니다.
 */
export const WORDMARK_WIDTH = 92;
export const WORDMARK_HEIGHT = 84;

/**
 * 글자(`MCM`)만 남기고 아래 엠블럼을 잘라내는 높이.
 * 그림 파일은 한 벌뿐이라, 시안처럼 위쪽만 보이도록 잘라 씁니다.
 */
const LETTERS_HEIGHT = 32;

/** 잘라 쓸 때는 머리말이 낮아야 해서 시안(2-1 Arc)의 69×25 에 맞춰 함께 줄입니다. */
const COMPACT_SCALE = 0.82;

interface BrandWordmarkProps {
  /**
   * 글자만 남기고 엠블럼을 잘라낸 작은 워드마크로 그립니다.
   * 카드 한 장이 화면을 채우는 Arc 화면에서 머리말 높이를 아끼려고 씁니다.
   */
  compact?: boolean;
}

/** MCM 워드마크. 홈 계열 화면의 머리말과 매칭 화면의 전환에서 함께 씁니다. */
export function BrandWordmark({ compact = false }: BrandWordmarkProps) {
  return (
    <View style={compact ? styles.compactFrame : styles.frame}>
      <Image
        source={mcmWordmark}
        style={compact ? styles.compactMark : styles.mark}
        contentFit="contain"
        accessibilityLabel="MCM"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: WORDMARK_WIDTH,
    height: WORDMARK_HEIGHT,
  },
  mark: {
    width: WORDMARK_WIDTH,
    height: WORDMARK_HEIGHT,
  },
  // 그림은 통째로 두고 틀만 글자 높이로 좁힙니다. 넘친 엠블럼은 틀이 잘라냅니다.
  compactFrame: {
    width: WORDMARK_WIDTH * COMPACT_SCALE,
    height: LETTERS_HEIGHT * COMPACT_SCALE,
    overflow: 'hidden',
  },
  compactMark: {
    width: WORDMARK_WIDTH * COMPACT_SCALE,
    height: WORDMARK_HEIGHT * COMPACT_SCALE,
  },
});
