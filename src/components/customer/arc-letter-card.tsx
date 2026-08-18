import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { LETTER_HEIGHT, LetterSheet } from '@components/common/letter-sheet';
import { FixedColors, Radius } from '@constants/theme';
import letterEmboss from '@assets/images/arc/letter-emboss.jpg';
import type { LetterContent } from '@/types/arc';

/**
 * 봉투에서 편지를 꺼내는 데 걸리는 시간.
 * 형압만 찍힌 뒷면이 잠깐 보였다가 글이 적힌 앞면으로 넘어갑니다.
 */
const FLIP_DELAY_MS = 260;
const FLIP_DURATION_MS = 620;

/** 뒤집힐 때 안쪽 모서리가 멀어져 보이도록 주는 원근. */
const PERSPECTIVE = 900;

interface ArcLetterCardProps {
  letter: LetterContent;
  /** 카드를 누르면 봉투 목록으로 돌아갑니다. */
  onPress: () => void;
}

/**
 * 봉투에서 꺼낸 편지 한 장.
 *
 * 처음에는 형압만 찍힌 뒷면(시안 2-2)이 보이고, 한 박자 뒤 글이 적힌 앞면(시안 2-3)으로
 * 뒤집힙니다. 두 면은 같은 자리에 겹쳐 두고 `backfaceVisibility` 로 등을 돌린 쪽만 감춥니다.
 */
export function ArcLetterCard({ letter, onPress }: ArcLetterCardProps) {
  // 지연 초기화로 한 번만 만들고, 이후에는 애니메이션으로만 값을 바꿉니다.
  const [flip] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.timing(flip, {
      toValue: 1,
      delay: FLIP_DELAY_MS,
      duration: FLIP_DURATION_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [flip]);

  const backRotation = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const frontRotation = flip.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="봉투 목록으로 돌아가기"
      onPress={onPress}
    >
      <View style={styles.stage}>
        <Animated.View
          style={[
            styles.face,
            { transform: [{ perspective: PERSPECTIVE }, { rotateY: backRotation }] },
          ]}
        >
          <Image
            source={letterEmboss}
            style={styles.emboss}
            contentFit="cover"
            accessible={false}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.face,
            { transform: [{ perspective: PERSPECTIVE }, { rotateY: frontRotation }] },
          ]}
        >
          <LetterSheet content={letter} />
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stage: {
    height: LETTER_HEIGHT,
  },
  // 두 면이 같은 자리에 겹쳐 있고, 등을 돌린 쪽은 그려지지 않습니다.
  face: {
    ...StyleSheet.absoluteFillObject,
    backfaceVisibility: 'hidden',
  },
  emboss: {
    flex: 1,
    borderRadius: Radius.card,
    backgroundColor: FixedColors.cardSurface,
    boxShadow: FixedColors.cardShadow,
  },
});
