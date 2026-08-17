import { StyleSheet, Text, View } from 'react-native';

import { ActionPill } from '@components/common/action-pill';
import { FixedColors, Spacing, Typography } from '@constants/theme';
import type { MemoryCardContent } from '@/types/visit';

/** 시안의 카드 치수. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
const CARD_MIN_HEIGHT = 441;
const CARD_PADDING_X = 34;
const CARD_PADDING_TOP = 47;
const CARD_PADDING_BOTTOM = 47;
const TITLE_TO_BODY = 10;
const BUTTON_WIDTH = 234;

interface RecordSummaryCardProps {
  content: MemoryCardContent;
  actionLabel: string;
  /** 카드 아래 버튼을 눌렀을 때. 비워 두면 흐려지고 눌리지 않습니다. */
  onAction?: () => void;
}

/**
 * 작성을 마친 기록을 보여주는 크림색 카드. 아래에 버튼 하나가 붙습니다.
 *
 * 좌우로 넘겨 보는 `memory-card` 와 같은 종이지만, 이쪽은 넘길 면이 없어
 * 화살표 대신 `다시 생성하기` 버튼이 그 자리에 놓입니다.
 */
export function RecordSummaryCard({ content, actionLabel, onAction }: RecordSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>{content.title}</Text>
        {content.lines.map((line, index) => (
          // 서버에서 오는 줄 목록이라 내용이 겹칠 수 있습니다. 순서가 바뀌지 않는 목록이라
          // 자리를 키로 씁니다.
          <Text key={index} style={styles.line}>
            {line}
          </Text>
        ))}
      </View>

      <ActionPill label={actionLabel} onPress={onAction} style={styles.action} />
    </View>
  );
}

const styles = StyleSheet.create({
  // 본문이 짧아도 버튼이 늘 카드 아래쪽에 오도록 최소 높이를 잡고 위아래로 벌립니다.
  card: {
    minHeight: CARD_MIN_HEIGHT,
    justifyContent: 'space-between',
    paddingHorizontal: CARD_PADDING_X,
    paddingTop: CARD_PADDING_TOP,
    paddingBottom: CARD_PADDING_BOTTOM,
    gap: Spacing.four,
    backgroundColor: FixedColors.cardSurface,
  },
  title: {
    ...Typography.titleEn20,
    color: FixedColors.cardAccent,
    marginBottom: TITLE_TO_BODY,
  },
  line: {
    ...Typography.bodyKo13,
    color: FixedColors.onLight,
  },
  action: {
    width: BUTTON_WIDTH,
    maxWidth: '100%',
    alignSelf: 'center',
  },
});
