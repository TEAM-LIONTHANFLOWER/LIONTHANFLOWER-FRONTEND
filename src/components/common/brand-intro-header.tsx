import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { FixedColors, Spacing, Typography } from '@constants/theme';
import mcmWordmark from '@assets/images/home/mcm-wordmark.png';

/** 시안(393 폭)의 세로 배치. 화면 위 여백부터 재고, 나머지는 요소 사이 간격입니다. */
const WORDMARK_TOP = 45;
const WORDMARK_WIDTH = 92;
const WORDMARK_HEIGHT = 84;
const WORDMARK_TO_TITLE = 12;

/** 고객·직원 홈이 모두 같은 문구를 씁니다. 화면마다 다른 것은 아래 설명 한 줄뿐입니다. */
const TITLE = 'Ready for your next move?';

interface BrandIntroHeaderProps {
  /** 타이틀 아래 한 줄 안내. 화면마다 다릅니다. */
  description: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * 홈 계열 화면 맨 위의 브랜드 머리말.
 * MCM 워드마크 + 공통 타이틀 + 화면별 안내 한 줄로 이루어집니다.
 *
 * 어두운 브랜드 배경(`BrandBackdrop`) 위에만 올라가므로 글자색이 흰색으로 고정입니다.
 */
export function BrandIntroHeader({ description, style }: BrandIntroHeaderProps) {
  return (
    <View style={style}>
      <Image
        source={mcmWordmark}
        style={styles.wordmark}
        contentFit="contain"
        accessibilityLabel="MCM"
      />
      <Text style={styles.title}>{TITLE}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    width: WORDMARK_WIDTH,
    height: WORDMARK_HEIGHT,
    marginTop: WORDMARK_TOP,
  },
  title: {
    ...Typography.titleEn20,
    color: FixedColors.onDark,
    marginTop: WORDMARK_TO_TITLE,
  },
  description: {
    ...Typography.bodyKo13,
    color: FixedColors.onDark,
    marginTop: Spacing.two,
  },
});
