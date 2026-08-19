import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ActionPill } from '@components/common/action-pill';
import { VisitMemoryLink } from '@components/common/visit-memory-link';
import { FixedColors, FontFamily, LineHeightRatio, Spacing } from '@constants/theme';
import { useCustomerVisitMemory } from '@hooks/use-customer-visit-memory';
import { useTranslation } from '@hooks/use-translation';

/** 편지지 폭에 맞춰 안내 문구가 너무 넓게 퍼지지 않도록 잡아 둡니다. */
const MESSAGE_WIDTH = 294;
const MESSAGE_FONT_SIZE = 14;

interface CustomerVisitMemoryLinkProps {
  variant?: 'text' | 'pill';
}

/**
 * 고객이 자기 방문 기록을 여는 `Visit Memory` 버튼.
 *
 * 직원이 전송하면 고객에게 알림이 하나 생기고, 그 알림이 가리키는 것이 방문 기록입니다.
 * 알림 목록을 보여주는 화면은 시안에 없어서, 이 버튼이 알림을 대신 읽어 가장 최근 기록을 엽니다.
 *
 * 아직 받은 기록이 없어도 `useCustomerVisitMemory` 가 기본 문구를 담은 편지를 내려줘서
 * 오류가 아닙니다 — 여기서는 로딩·오류일 때만 그 자리를 대신 그립니다.
 */
export function CustomerVisitMemoryLink({ variant }: CustomerVisitMemoryLinkProps) {
  const { t } = useTranslation();
  const { letter, isPending, isError, refetch } = useCustomerVisitMemory();

  let fallback: ReactNode;

  if (isPending) {
    fallback = <ActivityIndicator color={FixedColors.onDark} />;
  } else if (isError) {
    fallback = (
      <View style={styles.errorSlot}>
        <Text style={styles.message} accessibilityRole="alert">
          {t('visitMemory.loadFailed')}
        </Text>
        <ActionPill label={t('arc.retry')} tone="outline" onPress={refetch} />
      </View>
    );
  }

  return <VisitMemoryLink variant={variant} letter={letter} fallback={fallback} />;
}

const styles = StyleSheet.create({
  errorSlot: {
    alignItems: 'center',
    gap: Spacing.four,
  },
  message: {
    width: MESSAGE_WIDTH,
    maxWidth: '100%',
    fontFamily: FontFamily.sans,
    fontSize: MESSAGE_FONT_SIZE,
    lineHeight: MESSAGE_FONT_SIZE * LineHeightRatio.base,
    color: FixedColors.onDark,
    textAlign: 'center',
  },
});
