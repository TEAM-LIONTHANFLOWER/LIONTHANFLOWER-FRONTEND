import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { VerticalScrim } from '@components/common/vertical-scrim';
import {
  FixedColors,
  FontFamily,
  FontWeight,
  LineHeightRatio,
  Radius,
  Spacing,
  Typography,
} from '@constants/theme';
import { useLocale } from '@stores/locale-store';
import type { NowOnFeature } from '@/types/home';

/** 시안의 카드 안쪽 여백과 배지 치수. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
const CARD_INSET = 20;
const BADGE_HEIGHT = 26;
const BADGE_PADDING_X = 12;

/** 사진 위 글이 읽히도록 아래쪽 3 분의 2 를 어둡게 덮습니다. */
const SCRIM_TOP = '35.6%';

const TITLE_FONT_SIZE = 16;

interface NowOnCardProps {
  feature: NowOnFeature;
  style?: StyleProp<ViewStyle>;
}

/**
 * 지금 진행 중인 브랜드 경험을 보여주는 정사각형 사진 카드.
 *
 * 시안은 333×333 이지만 화면 폭에 맞춰 늘어나도 정사각형을 지키도록 `aspectRatio` 로 두었습니다.
 * 사진은 위쪽을 기준으로 잘립니다 — 시안에서 피사체가 카드 윗부분에 잡혀 있습니다.
 */
export function NowOnCard({ feature, style }: NowOnCardProps) {
  const locale = useLocale();

  return (
    <View style={[styles.card, style]}>
      <Image
        source={feature.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="top"
        accessible={false}
      />
      <VerticalScrim maxOpacity={1} style={styles.scrim} />

      <View style={styles.content}>
        <View style={styles.heading}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{feature.badge}</Text>
          </View>
          <Text style={styles.title}>{feature.title}</Text>
        </View>
        <Text style={styles.description}>{feature.description[locale]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: SCRIM_TOP,
    bottom: 0,
  },
  content: {
    position: 'absolute',
    left: CARD_INSET,
    right: CARD_INSET,
    bottom: CARD_INSET,
    gap: Spacing.two,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badge: {
    height: BADGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: BADGE_PADDING_X,
    borderRadius: Radius.pill,
    backgroundColor: FixedColors.onDark,
  },
  badgeLabel: {
    ...Typography.bodyKo13,
    color: FixedColors.onLight,
  },
  // 시안은 Pretendard SemiBold 인데 앱에는 Regular 와 Bold 두 벌만 등록돼 있어 Bold 로 씁니다.
  title: {
    fontFamily: FontFamily.sansBold,
    fontSize: TITLE_FONT_SIZE,
    lineHeight: TITLE_FONT_SIZE * LineHeightRatio.base,
    fontWeight: FontWeight.bold,
    color: FixedColors.onDark,
  },
  description: {
    ...Typography.bodyKo13,
    color: FixedColors.onDark,
  },
});
