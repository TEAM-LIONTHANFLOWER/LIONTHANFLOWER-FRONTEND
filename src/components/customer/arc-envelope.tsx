import { Animated, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { FixedColors, Radius, Typography } from '@constants/theme';
import envelopeFlap from '@assets/images/arc/envelope-flap-front.svg';
import envelopeLeather from '@assets/images/arc/envelope-leather.png';
import waxSeal from '@assets/images/arc/wax-seal.png';
import mcmWordmark from '@assets/images/home/mcm-wordmark.png';
import type { ArcEnvelopeInfo } from '@/types/arc';

/** 시안(2-1 Arc)의 봉투 치수. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
export const ENVELOPE_HEIGHT = 441;

/** 봉투 겉면에 두르는 선. 시안은 0.5 라 실기기에서 가장 얇게 그려지는 굵기를 씁니다. */
const EDGE_WIDTH = StyleSheet.hairlineWidth;

/**
 * 겉면에 얹는 가죽 결.
 * 시안은 곱하기 합성이지만 플랫폼마다 지원이 갈려서, 투명도로 코냑 위에 결만 비치게 합니다.
 */
const LEATHER_OPACITY = 0.3;

/**
 * 덮개 그림(361×178)은 봉투(333)보다 좌우로 넓고 위로도 올라가 있습니다.
 * 넓은 채로 얹어야 접힌 자국의 각도가 시안과 같아지고, 넘친 만큼은 봉투가 잘라냅니다.
 *
 * 봉투 폭이 화면 따라 달라지므로 가로는 비율로 잡습니다 —
 * 폭은 361 / 333 = 108.408%, 왼쪽으로 14 / 333 = 4.204% 만큼 나갑니다.
 * 세로는 시안대로 고정입니다. 덮개 깊이는 봉투가 넓어져도 그대로여야 합니다.
 */
const FLAP_WIDTH = '108.408%';
const FLAP_LEFT = '-4.204%';
const FLAP_HEIGHT = 178;
const FLAP_TOP = -12;

/**
 * 덮개가 끝나면서 드러나는 앞주머니의 윗변.
 * 편지를 꺼낼 때 이 선 아래를 편지 위에 한 번 더 덮어, 편지가 주머니 뒤에서 빠져나오게 합니다.
 */
export const ENVELOPE_POCKET_TOP = FLAP_TOP + FLAP_HEIGHT;

/** 덮개 위에 얹는 글. 덮개가 끝나기 전에 두 줄이 다 들어갑니다. */
const TEXT_LEFT = 43;
const TITLE_TOP = 29;
const META_TOP = 59;

/** 실링은 덮개가 끝나는 자리에 걸립니다. */
const SEAL_SIZE = 90;
const SEAL_TOP = 107;

/** 겉면 아래쪽에 눌러 찍은 심벌. */
const SYMBOL_WIDTH = 91;
const SYMBOL_HEIGHT = 83;
const SYMBOL_TOP = 322;
const SYMBOL_OPACITY = 0.37;

/**
 * 봉투를 여는 동안의 움직임. 값은 `openProgress` 안에서의 구간입니다.
 *
 * 실링이 먼저 떨어져 나가고, 이어서 덮개가 접힌 자국을 축으로 뒤로 젖혀집니다.
 * 90° 를 넘기면 뒷면이 보일 자리라 `backfaceVisibility` 로 감춰 그대로 사라지게 둡니다.
 */
const SEAL_BREAK_END = 0.22;
const SEAL_BREAK_SCALE = 1.18;
const FLAP_OPEN_END = 0.34;
const FLAP_OPEN_ANGLE = '-118deg';
/** 젖혀지는 덮개가 평면처럼 줄어들지 않고 앞으로 다가오도록 주는 원근. */
const FLAP_PERSPECTIVE = 900;

interface ArcEnvelopeProps {
  entry: ArcEnvelopeInfo;
  /**
   * 뒤에 비스듬히 겹쳐 보이는 봉투로 그립니다.
   * 겉면이 한 톤 어두워지고 글씨를 읽을 일이 없어 보조기기에서도 숨깁니다.
   */
  stacked?: boolean;
  /**
   * 봉투가 열린 정도(0 = 봉해진 채, 1 = 다 열림).
   * 넘기지 않으면 봉해진 모습 그대로 멈춰 있습니다.
   */
  openProgress?: Animated.Value;
  style?: StyleProp<ViewStyle>;
}

/**
 * Arc 한 건을 담은 봉투 겉면.
 * 가죽 결 위에 덮개와 실링을 얹고, 덮개에 어느 매장에서 언제 만든 Arc 인지 적습니다.
 *
 * 어두운 브랜드 배경 위에만 올라가므로 색이 `FixedColors` 로 고정입니다.
 */
export function ArcEnvelope({ entry, stacked = false, openProgress, style }: ArcEnvelopeProps) {
  const flapOpenStyle =
    openProgress === undefined
      ? null
      : {
          transform: [
            { perspective: FLAP_PERSPECTIVE },
            {
              rotateX: openProgress.interpolate({
                inputRange: [0, FLAP_OPEN_END],
                outputRange: ['0deg', FLAP_OPEN_ANGLE],
                extrapolate: 'clamp',
              }),
            },
          ],
        };

  const sealBreakStyle =
    openProgress === undefined
      ? null
      : {
          opacity: openProgress.interpolate({
            inputRange: [0, SEAL_BREAK_END],
            outputRange: [1, 0],
            extrapolate: 'clamp',
          }),
          transform: [
            {
              scale: openProgress.interpolate({
                inputRange: [0, SEAL_BREAK_END],
                outputRange: [1, SEAL_BREAK_SCALE],
                extrapolate: 'clamp',
              }),
            },
          ],
        };

  return (
    <View
      // 겹쳐 보이는 봉투는 장식이라 스크린 리더가 읽지 않게 통째로 감춥니다.
      accessibilityElementsHidden={stacked}
      importantForAccessibility={stacked ? 'no-hide-descendants' : 'auto'}
      style={[styles.envelope, stacked && styles.envelopeStacked, style]}
    >
      {stacked ? null : (
        <Image
          source={envelopeLeather}
          style={styles.leather}
          contentFit="cover"
          accessible={false}
        />
      )}

      <Animated.View style={[styles.flap, flapOpenStyle]}>
        <Image source={envelopeFlap} style={styles.flapArt} contentFit="fill" accessible={false} />
      </Animated.View>

      <Text style={styles.title}>{entry.envelopeTitle}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaLine}>{entry.store}</Text>
        <Text style={styles.metaLine}>{entry.date}</Text>
      </View>

      <Animated.View style={[styles.sealRow, sealBreakStyle]}>
        <Image source={waxSeal} style={styles.seal} contentFit="contain" accessible={false} />
      </Animated.View>

      <View style={styles.symbolRow}>
        <Image source={mcmWordmark} style={styles.symbol} contentFit="contain" accessible={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  envelope: {
    height: ENVELOPE_HEIGHT,
    borderRadius: Radius.card,
    borderWidth: EDGE_WIDTH,
    borderColor: FixedColors.envelopeEdge,
    overflow: 'hidden',
    backgroundColor: FixedColors.envelopeSurface,
    boxShadow: FixedColors.cardShadow,
  },
  // 뒤에 깔린 봉투는 겉면 하나로만 보여서 결도 테두리도 없이 어두운 면으로 둡니다.
  envelopeStacked: {
    backgroundColor: FixedColors.cardAccent,
    borderColor: 'transparent',
    opacity: 0.5,
  },
  leather: {
    ...StyleSheet.absoluteFillObject,
    opacity: LEATHER_OPACITY,
  },
  // 덮개는 접힌 자국(윗변)을 축으로 젖혀집니다. 회전축을 위로 올려 두고,
  // 등을 돌린 뒤로는 그리지 않아 젖혀지다 사라지는 것처럼 보이게 합니다.
  // 봉투를 덮고 있는 줄이라, 누르기가 그대로 봉투까지 내려가게 둡니다.
  flap: {
    position: 'absolute',
    top: FLAP_TOP,
    left: FLAP_LEFT,
    width: FLAP_WIDTH,
    height: FLAP_HEIGHT,
    transformOrigin: '50% 0%',
    backfaceVisibility: 'hidden',
    pointerEvents: 'none',
  },
  flapArt: {
    flex: 1,
  },
  title: {
    ...Typography.titleEn20,
    color: FixedColors.cardAccent,
    position: 'absolute',
    top: TITLE_TOP,
    left: TEXT_LEFT,
  },
  meta: {
    position: 'absolute',
    top: META_TOP,
    left: TEXT_LEFT,
  },
  metaLine: {
    ...Typography.bodyEn14,
    color: FixedColors.cardAccent,
  },
  // 실링과 심벌은 가로 가운데에 옵니다. 봉투 폭이 화면 따라 달라져서
  // 좌표 대신 폭을 꽉 채운 줄 안에서 가운데 정렬로 잡습니다.
  // 봉투를 덮고 있는 줄이라, 누르기가 그대로 봉투까지 내려가게 둡니다.
  sealRow: {
    position: 'absolute',
    top: SEAL_TOP,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  // 시안에는 실링에도 그림자가 있지만 넣지 않습니다. `boxShadow` 는 그림의 투명한 부분을
  // 따라가지 못해 동그란 실링 둘레에 네모난 그림자가 생깁니다.
  // 실링 그림 자체에 이미 음영이 구워져 있어 없어도 종이에서 떠 보입니다.
  seal: {
    width: SEAL_SIZE,
    height: SEAL_SIZE,
  },
  symbolRow: {
    position: 'absolute',
    top: SYMBOL_TOP,
    left: 0,
    right: 0,
    alignItems: 'center',
    opacity: SYMBOL_OPACITY,
    pointerEvents: 'none',
  },
  symbol: {
    width: SYMBOL_WIDTH,
    height: SYMBOL_HEIGHT,
  },
});
