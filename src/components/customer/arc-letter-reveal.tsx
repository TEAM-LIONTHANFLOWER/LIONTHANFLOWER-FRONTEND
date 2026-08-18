import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { LetterSheet } from '@components/common/letter-sheet';
import {
  ArcEnvelope,
  ENVELOPE_HEIGHT,
  ENVELOPE_POCKET_TOP,
} from '@components/customer/arc-envelope';
import { FixedColors, Radius } from '@constants/theme';
import letterEmboss from '@assets/images/arc/letter-emboss.jpg';
import type { ArcEntry } from '@/types/arc';

/**
 * 봉투에서 편지가 빠져나오는 데 걸리는 시간.
 * 실링이 떨어지고 덮개가 젖혀지는 동안 편지가 올라오기 시작해, 봉투는 아래로 가라앉습니다.
 */
const OPEN_DURATION_MS = 680;
/** 편지가 다 나온 뒤 한 박자 쉬고 앞면으로 넘어갑니다. */
const FLIP_DELAY_MS = 80;
const FLIP_DURATION_MS = 580;

/** 편지를 다시 눌러 봉투로 돌아갈 때. 되돌아가는 길은 조금 짧게 잡습니다. */
const CLOSE_FLIP_DURATION_MS = 380;
const CLOSE_DURATION_MS = 520;

/** 뒤집힐 때 안쪽 모서리가 멀어져 보이도록 주는 원근. */
const PERSPECTIVE = 900;

/**
 * 봉투 안에 들어가 있는 편지의 자리.
 * 주머니 윗변보다 아래에서 시작해야 시작 프레임에서 편지 끝이 삐져나오지 않습니다.
 */
const LETTER_TUCK_Y = 176;
const LETTER_TUCK_SCALE = 0.92;

/** 편지가 빠져나오는 동안 봉투가 아래로 물러나는 거리. */
const ENVELOPE_SINK_Y = 108;

/**
 * `open` 값 안에서 각 움직임이 차지하는 구간.
 * 편지가 절반쯤 나왔을 때 봉투가 내려가기 시작하고, 다 나오기 직전에 봉투가 사라집니다.
 */
const LETTER_RISE_RANGE = [0.12, 0.88];
const LETTER_GROW_RANGE = [0.12, 1];
const ENVELOPE_SINK_RANGE = [0.45, 1];
const ENVELOPE_FADE_RANGE = [0.62, 1];

interface ArcLetterRevealProps {
  entry: ArcEntry;
  /** 되돌아가는 애니메이션까지 끝나면 부릅니다. 그 전에 지우면 편지가 툭 사라집니다. */
  onClose: () => void;
}

/**
 * 봉투를 열어 편지를 꺼내 보여주는 무대.
 *
 * 실링이 떨어지고 덮개가 젖혀지면 편지가 앞주머니 뒤에서 위로 빠져나오고,
 * 빈 봉투는 아래로 가라앉으며 사라집니다. 이때 보이는 것은 형압만 찍힌 뒷면(시안 2-2)이라
 * 한 박자 뒤 글이 적힌 앞면(시안 2-3)으로 뒤집힙니다.
 *
 * 봉투는 두 벌을 겹쳐 놓습니다. 한 벌은 편지 뒤에, 한 벌은 주머니 높이에서 잘라 편지 앞에
 * 둡니다. 두 벌이 같은 값으로 함께 움직여서 화면에서는 한 장의 봉투로 보이고,
 * 편지는 그 사이를 지나며 주머니에서 빠져나오는 것처럼 보입니다.
 */
export function ArcLetterReveal({ entry, onClose }: ArcLetterRevealProps) {
  // 지연 초기화로 한 번만 만들고, 이후에는 애니메이션으로만 값을 바꿉니다.
  const [open] = useState(() => new Animated.Value(0));
  const [flip] = useState(() => new Animated.Value(0));

  /** 지금 돌고 있는 애니메이션. 되돌릴 때 먼저 멈춰야 두 애니메이션이 값을 다투지 않습니다. */
  const running = useRef<Animated.CompositeAnimation | null>(null);
  const isClosing = useRef(false);

  useEffect(() => {
    const opening = Animated.sequence([
      Animated.timing(open, {
        toValue: 1,
        duration: OPEN_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(flip, {
        toValue: 1,
        delay: FLIP_DELAY_MS,
        duration: FLIP_DURATION_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    running.current = opening;
    opening.start();

    return () => running.current?.stop();
  }, [flip, open]);

  const handlePress = useCallback(() => {
    if (isClosing.current) {
      return;
    }

    isClosing.current = true;
    // 여는 도중에 눌렀다면 지금 값에서 그대로 되감습니다.
    running.current?.stop();

    // 아직 앞면으로 넘어가기 전이라면 뒤집기를 건너뜁니다. 그대로 두면 되돌릴 것이
    // 없는데도 편지가 멈춰 선 채 뒤집기 시간만큼 흘려보냅니다.
    flip.stopAnimation((flipped: number) => {
      const sinkBack = Animated.timing(open, {
        toValue: 0,
        duration: CLOSE_DURATION_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      });

      const closing =
        flipped === 0
          ? sinkBack
          : Animated.sequence([
              Animated.timing(flip, {
                toValue: 0,
                duration: CLOSE_FLIP_DURATION_MS,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: true,
              }),
              sinkBack,
            ]);

      running.current = closing;
      closing.start(({ finished }) => {
        if (finished) {
          onClose();
        }
      });
    });
  }, [flip, onClose, open]);

  const letterStyle = {
    transform: [
      {
        translateY: open.interpolate({
          inputRange: LETTER_RISE_RANGE,
          outputRange: [LETTER_TUCK_Y, 0],
          extrapolate: 'clamp',
        }),
      },
      {
        scale: open.interpolate({
          inputRange: LETTER_GROW_RANGE,
          outputRange: [LETTER_TUCK_SCALE, 1],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  // 편지 뒤의 봉투와 앞의 주머니가 같은 값으로 움직여야 한 장으로 보입니다.
  const envelopeStyle = {
    opacity: open.interpolate({
      inputRange: ENVELOPE_FADE_RANGE,
      outputRange: [1, 0],
      extrapolate: 'clamp',
    }),
    transform: [
      {
        translateY: open.interpolate({
          inputRange: ENVELOPE_SINK_RANGE,
          outputRange: [0, ENVELOPE_SINK_Y],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  const backRotation = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const frontRotation = flip.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="봉투 목록으로 돌아가기"
      onPress={handlePress}
    >
      {/* 봉투 밖으로 나온 편지 자락이 보이지 않도록 무대가 잘라냅니다.
          그림자는 잘려 나가므로 무대가 대신 들고 있습니다. */}
      <View style={styles.stage}>
        <Animated.View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.layer, envelopeStyle]}
        >
          <ArcEnvelope entry={entry} openProgress={open} />
        </Animated.View>

        <Animated.View style={[styles.layer, letterStyle]}>
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
            <LetterSheet content={entry.letter} />
          </Animated.View>
        </Animated.View>

        {/* 봉투 한 벌을 주머니 높이에서 잘라 편지 위에 다시 덮습니다. */}
        <Animated.View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.pocket, envelopeStyle]}
        >
          <View style={styles.pocketArt}>
            <ArcEnvelope entry={entry} openProgress={open} />
          </View>
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stage: {
    height: ENVELOPE_HEIGHT,
    borderRadius: Radius.card,
    overflow: 'hidden',
    boxShadow: FixedColors.cardShadow,
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
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
  },
  // 주머니는 편지 위에 오지만 누르기는 그대로 아래로 내려가게 둡니다.
  pocket: {
    position: 'absolute',
    top: ENVELOPE_POCKET_TOP,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  // 잘라 낸 만큼 봉투를 끌어올려, 뒤에 깔린 봉투와 정확히 같은 자리에 겹칩니다.
  pocketArt: {
    marginTop: -ENVELOPE_POCKET_TOP,
  },
});
