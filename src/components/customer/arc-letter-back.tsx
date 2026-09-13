import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import letterPaper from '@assets/images/arc/letter-paper.jpg';
import mcmLogo from '@assets/images/arc/mcm-logo.svg';
import { toLetterBackArt } from '@constants/arc';
import { FixedColors, FontFamily, FontWeight, LineHeightRatio, Radius } from '@constants/theme';

/** 캡션이 편지지 맨 위에서 떨어진 자리. */
const CAPTION_TOP = 22;
const CAPTION_FONT_SIZE = 12;

const LOGO_TOP = CAPTION_TOP + 70;
const LOGO_WIDTH = 55;
const LOGO_HEIGHT = 49;

/** 도시 그림은 편지지 맨 아래에 붙습니다. 크기는 도시마다 원본이 달라 `toLetterBackArt()` 가 정합니다. */
const CITY_ART_BOTTOM = 18;

interface ArcLetterBackProps {
  /**
   * 구매 국가. `ArcEntry.countryCode` 를 그대로 받습니다(`KR` `DE` `FR`).
   * 지원하는 국가가 아니면 캡션·로고·도시 그림 없이 빈 편지지만 보여줍니다.
   */
  countryCode?: string | null;
  style?: StyleProp<ViewStyle>;
}

/**
 * 봉투에서 편지가 빠져나오는 동안 잠깐 보이는 뒷면(시안 2-2).
 *
 * 예전에는 형압만 찍힌 `letter-emboss.jpg` 한 장이었지만, 구매 매장의 도시에 따라
 * `MCM HAUS · {도시}` 캡션과 도시 스카이라인 그림을 얹은 편지지로 바뀝니다. 바탕은
 * 도시와 상관없이 늘 `letter-paper.jpg` 입니다.
 *
 * 캡션·도시 그림은 구매 국가마다 `@constants/arc` 의 `toLetterBackArt()` 로 한 벌로 묶어 둡니다 —
 * 캡션은 `countryCode` 를 그대로 대문자로 찍은 게 아니라 도시별 실제 표기(뮌헨의 움라우트 등)이고,
 * 그림 크기도 도시 원본마다 달라 함께 정합니다. 로고(`mcm-logo.svg`)만 국가와 상관없이 고정입니다.
 */
export function ArcLetterBack({ countryCode, style }: ArcLetterBackProps) {
  const art = toLetterBackArt(countryCode);

  return (
    <View style={[styles.sheet, style]}>
      <Image
        source={letterPaper}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        accessible={false}
      />

      {art === undefined ? null : (
        <>
          <Text style={styles.caption}>{art.caption}</Text>

          <View style={styles.logoRow}>
            <Image source={mcmLogo} style={styles.logo} contentFit="contain" accessible={false} />
          </View>

          <View style={styles.cityArtRow}>
            <Image
              source={art.image}
              style={{ width: art.width, height: art.height }}
              contentFit="contain"
              accessible={false}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    borderRadius: Radius.card,
    overflow: 'hidden',
    backgroundColor: FixedColors.cardSurface,
  },
  caption: {
    position: 'absolute',
    top: CAPTION_TOP,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: FontFamily.inter,
    fontSize: CAPTION_FONT_SIZE,
    lineHeight: CAPTION_FONT_SIZE * LineHeightRatio.base,
    fontWeight: FontWeight.regular,
    // `mcm-logo.svg` 와 같은 브랜드 브라운입니다 — 로고·캡션이 한 벌로 보이도록 맞춥니다.
    color: FixedColors.frameCaptionBrown,
  },
  // 폭이 고정된 로고·도시 그림은 가운데 정렬을 줄 하나로 감싸 맞춥니다(`ArcEnvelope` 의
  // `sealRow`/`symbolRow` 와 같은 방식).
  logoRow: {
    position: 'absolute',
    top: LOGO_TOP,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },
  cityArtRow: {
    position: 'absolute',
    bottom: CITY_ART_BOTTOM,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
