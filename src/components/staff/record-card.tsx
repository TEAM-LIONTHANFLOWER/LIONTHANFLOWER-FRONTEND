import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  FixedColors,
  FontFamily,
  LineHeightRatio,
  Radius,
  Spacing,
  Typography,
} from '@constants/theme';

/** 시안의 카드 안쪽 여백. Spacing 스케일에 16 과 24 사이 값이 없어 세로만 따로 둡니다. */
const CARD_PADDING_Y = 18;

/** 상태 배지 치수. */
const BADGE_PADDING_X = 15;
const BADGE_PADDING_Y = 5;
const BADGE_FONT_SIZE = 12;

interface RecordCardProps {
  /** 왼쪽 위 상태 배지. 없으면 그리지 않습니다. */
  badge?: string;
  title: string;
  /** 제목 아래 본문. 한 줄씩 그립니다. */
  lines: readonly string[];
  /** 카드 아래쪽 버튼 줄. 없으면 그리지 않습니다. */
  actions?: ReactNode;
  /** 카드를 눌렀을 때. 없으면 눌리지 않는 카드가 됩니다. */
  onPress?: () => void;
}

/**
 * 어두운 배경 위에 얹는 크림색 카드.
 * 직원 홈의 고객 카드와 Arc 기록 카드가 모두 이 껍데기를 씁니다.
 *
 * 내용을 해석하지 않고 받은 대로 그립니다. 어떤 배지와 버튼을 넣을지는
 * `visit-card` / `arc-record-card` 가 정합니다.
 */
export function RecordCard({ badge, title, lines, actions, onPress }: RecordCardProps) {
  const content = (
    <>
      <View style={styles.summary}>
        {badge === undefined ? null : (
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{badge}</Text>
          </View>
        )}

        <View>
          <Text style={styles.title}>{title}</Text>
          {lines.map((line, index) => (
            // 서버에서 오는 줄 목록이라 내용이 겹칠 수 있습니다. 순서가 바뀌지 않는 목록이라
            // 자리를 키로 씁니다.
            <Text key={index} style={styles.line}>
              {line}
            </Text>
          ))}
        </View>
      </View>

      {actions === undefined ? null : <View style={styles.actions}>{actions}</View>}
    </>
  );

  if (onPress === undefined) {
    return <View style={styles.card}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title} 상세 보기`}
      onPress={onPress}
      style={styles.card}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: CARD_PADDING_Y,
    backgroundColor: FixedColors.cardSurface,
  },
  summary: {
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  badge: {
    paddingHorizontal: BADGE_PADDING_X,
    paddingVertical: BADGE_PADDING_Y,
    borderRadius: Radius.pill,
    backgroundColor: FixedColors.cardAccent,
  },
  badgeLabel: {
    fontFamily: FontFamily.sans,
    fontSize: BADGE_FONT_SIZE,
    lineHeight: BADGE_FONT_SIZE * LineHeightRatio.base,
    color: FixedColors.onDark,
  },
  title: {
    ...Typography.titleEn20,
    color: FixedColors.onLight,
  },
  line: {
    ...Typography.bodyKo13,
    color: FixedColors.onLight,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
