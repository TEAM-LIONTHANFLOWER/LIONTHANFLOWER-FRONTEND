import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FixedColors, FontFamily, FontWeight, LineHeightRatio, Spacing } from '@constants/theme';

/** 날짜 머리글과 카드, 카드와 카드 사이. Spacing 스케일에 8 과 16 사이 값이 없어 따로 둡니다. */
const CARD_GAP = 12;
const DATE_FONT_SIZE = 13;

type DateSectionProps = PropsWithChildren<{
  /** `YYYY.MM.DD` */
  date: string;
}>;

/** 같은 날 들어온 카드를 하나로 묶고, 위에 날짜와 가로선을 답니다. */
export function DateSection({ date, children }: DateSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.date}>{date}</Text>
        <View style={styles.rule} />
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: CARD_GAP,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  date: {
    fontFamily: FontFamily.sansBold,
    fontSize: DATE_FONT_SIZE,
    lineHeight: DATE_FONT_SIZE * LineHeightRatio.base,
    fontWeight: FontWeight.bold,
    color: FixedColors.onDark,
  },
  // 날짜 오른쪽 남은 자리를 가로선이 채웁니다.
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: FixedColors.onDark,
  },
});
