import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { FixedColors, Radius, Typography } from '@constants/theme';
import envelopeFlap from '@assets/images/arc/envelope-flap.png';
import waxSeal from '@assets/images/arc/wax-seal.png';
import mcmWordmark from '@assets/images/home/mcm-wordmark.png';
import type { ArcEntry } from '@/types/arc';

/** 시안(2-1 Arc)의 봉투 치수. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
export const ENVELOPE_HEIGHT = 441;
const TEXT_LEFT = 39;
const TITLE_TOP = 220;
const STORE_TOP = 250;

/**
 * 덮개 그림은 봉투보다 좌우로 30 씩 넓습니다.
 * 넓은 채로 얹어야 접힌 자국의 각도가 시안과 같아지고, 넘친 만큼은 봉투가 잘라냅니다.
 */
const FLAP_OVERHANG = 30;
const FLAP_TOP = -28;
const FLAP_HEIGHT = 162;

const SEAL_SIZE = 108;
const SEAL_TOP = 53;

const SYMBOL_WIDTH = 66;
const SYMBOL_HEIGHT = 60;
const SYMBOL_TOP = 331;

interface ArcEnvelopeProps {
  entry: ArcEntry;
  /**
   * 뒤에 비스듬히 겹쳐 보이는 봉투로 그립니다.
   * 겉면이 한 톤 어두워지고 글씨를 읽을 일이 없어 보조기기에서도 숨깁니다.
   */
  stacked?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Arc 한 건을 담은 봉투 겉면.
 * 덮개와 실링을 얹고 그 아래에 어느 매장에서 언제 만든 Arc 인지 적습니다.
 *
 * 어두운 브랜드 배경 위에만 올라가므로 색이 `FixedColors` 로 고정입니다.
 */
export function ArcEnvelope({ entry, stacked = false, style }: ArcEnvelopeProps) {
  return (
    <View
      // 겹쳐 보이는 봉투는 장식이라 스크린 리더가 읽지 않게 통째로 감춥니다.
      accessibilityElementsHidden={stacked}
      importantForAccessibility={stacked ? 'no-hide-descendants' : 'auto'}
      style={[styles.envelope, stacked && styles.envelopeStacked, style]}
    >
      <Image source={envelopeFlap} style={styles.flap} contentFit="fill" accessible={false} />

      <View style={styles.sealRow} pointerEvents="none">
        <Image source={waxSeal} style={styles.seal} contentFit="contain" accessible={false} />
      </View>

      <Text style={styles.title}>{entry.envelopeTitle}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaLine}>{entry.store}</Text>
        <Text style={styles.metaLine}>{entry.date}</Text>
      </View>

      <View style={styles.symbolRow} pointerEvents="none">
        <Image source={mcmWordmark} style={styles.symbol} contentFit="contain" accessible={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  envelope: {
    height: ENVELOPE_HEIGHT,
    borderRadius: Radius.card,
    overflow: 'hidden',
    backgroundColor: FixedColors.envelopeSurface,
    boxShadow: FixedColors.cardShadow,
  },
  envelopeStacked: {
    backgroundColor: FixedColors.cardAccent,
  },
  flap: {
    position: 'absolute',
    top: FLAP_TOP,
    left: -FLAP_OVERHANG,
    right: -FLAP_OVERHANG,
    height: FLAP_HEIGHT,
  },
  // 실링과 심벌은 가로 가운데에 옵니다. 봉투 폭이 화면 따라 달라져서
  // 좌표 대신 폭을 꽉 채운 줄 안에서 가운데 정렬로 잡습니다.
  sealRow: {
    position: 'absolute',
    top: SEAL_TOP,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  // 시안에는 실링에도 그림자가 있지만 넣지 않습니다. `boxShadow` 는 그림의 투명한 부분을
  // 따라가지 못해 동그란 실링 둘레에 네모난 그림자가 생깁니다.
  // 실링 그림 자체에 이미 음영이 구워져 있어 없어도 종이에서 떠 보입니다.
  seal: {
    width: SEAL_SIZE,
    height: SEAL_SIZE,
  },
  title: {
    ...Typography.titleEn20,
    color: FixedColors.onDark,
    position: 'absolute',
    top: TITLE_TOP,
    left: TEXT_LEFT,
  },
  meta: {
    position: 'absolute',
    top: STORE_TOP,
    left: TEXT_LEFT,
  },
  metaLine: {
    ...Typography.bodyEn14,
    color: FixedColors.onDark,
  },
  symbolRow: {
    position: 'absolute',
    top: SYMBOL_TOP,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  symbol: {
    width: SYMBOL_WIDTH,
    height: SYMBOL_HEIGHT,
  },
});
