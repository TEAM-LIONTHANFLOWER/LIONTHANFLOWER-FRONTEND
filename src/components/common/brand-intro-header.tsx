import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { BrandWordmark } from '@components/common/brand-wordmark';
import { FixedColors, Spacing, Typography } from '@constants/theme';

/**
 * 시안(393 폭)에서 워드마크가 안전 영역 위쪽 끝에서 떨어진 거리.
 * 매칭 화면이 로고를 이 자리로 옮기며 넘어오기 때문에 밖으로 냅니다.
 */
export const WORDMARK_TOP = 45;

/** 워드마크 아래 타이틀까지의 간격. */
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
      <BrandWordmark style={styles.wordmark} />
      <Text style={styles.title}>{TITLE}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wordmark: {
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
