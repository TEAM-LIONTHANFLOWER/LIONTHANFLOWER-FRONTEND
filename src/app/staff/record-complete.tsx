import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ActionPill } from '@components/common/action-pill';
import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { InitialSetupButton } from '@components/common/initial-setup-button';
import { ScreenContainer } from '@components/common/screen-container';
import { VisitMemoryLink } from '@components/common/visit-memory-link';
import { RecordSummaryCard } from '@components/staff/record-summary-card';
import {
  RECORD_COMPLETE_CARDS,
  RECORD_COMPLETE_DESCRIPTION,
  RECORD_FLOW_COPY,
  RECORD_REGENERATE_LABEL,
} from '@constants/record-form';
import { Spacing } from '@constants/theme';
import { useRecordFormStore } from '@stores/record-form-store';
import type { RecordFlow } from '@/types/record-form';

/** 상단 줄과 카드 사이, 카드와 버튼 사이. Spacing 스케일에 16 과 24 사이 값이 없어 따로 둡니다. */
const CARD_GAP = 20;

/**
 * 직원용 기록 작성 완료 화면 — `/staff/record-complete`
 *
 * 방금 쓴 기록을 카드 한 장으로 보여주고, 고칠지 보낼지 고르게 합니다.
 * `flow` 쿼리로 어느 기록인지 정합니다. 값이 없거나 모르는 값이면 Arc 로 봅니다.
 *
 * `수정` 은 적은 값을 그대로 둔 채 작성 화면의 첫 단계로 되돌립니다 — 값이 스토어에 있어
 * 화면을 새로 열어도 남습니다. `전송` 은 아직 API 가 없어, 지금은 값만 비우고 직원 홈으로
 * 돌아갑니다. 전송 API 가 붙으면 이 자리에서 `useMutation` 을 부릅니다.
 */
export default function StaffRecordCompleteScreen() {
  const router = useRouter();
  const { flow: requestedFlow } = useLocalSearchParams<{ flow?: string }>();
  const reset = useRecordFormStore((state) => state.reset);

  const flow: RecordFlow = requestedFlow === 'memory' ? 'memory' : 'arc';
  const copy = RECORD_FLOW_COPY[flow];

  const handleEdit = useCallback(() => {
    router.replace({ pathname: '/staff/record-form', params: { flow } });
  }, [flow, router]);

  const handleSubmit = useCallback(() => {
    reset(flow);
    // 작성 화면들을 스택에서 걷어내고 직원 홈으로 돌아갑니다.
    router.dismissTo('/staff/dashboard');
  }, [flow, reset, router]);

  return (
    // 배경은 `ScreenContainer` 바깥에 둡니다. 안에 넣으면 안전 영역 안쪽에 갇혀
    // 노치와 홈 인디케이터 자리에 색이 끊깁니다. 자세한 이유는 `screen-container.tsx` 참고.
    <View style={styles.root}>
      <BrandBackdrop />

      <ScreenContainer backgroundColor="transparent" style={styles.stage}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <BrandIntroHeader description={RECORD_COMPLETE_DESCRIPTION} />

          <View style={styles.toolbar}>
            {/* Arc 는 방금 쓴 편지가 곧 카드라 따로 열어 볼 기록이 없습니다. */}
            <View>{flow === 'memory' ? <VisitMemoryLink /> : null}</View>
            <InitialSetupButton />
          </View>

          <View style={styles.card}>
            <RecordSummaryCard
              content={RECORD_COMPLETE_CARDS[flow]}
              actionLabel={RECORD_REGENERATE_LABEL}
            />
          </View>

          <View style={styles.actions}>
            <ActionPill label={copy.editLabel} onPress={handleEdit} tone="light" fill />
            <ActionPill label={copy.submitLabel} onPress={handleSubmit} tone="light" fill />
          </View>
        </ScrollView>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  // 세로 여백과 간격은 스크롤 콘텐츠가 직접 들고 있습니다.
  stage: {
    paddingVertical: 0,
    gap: 0,
  },
  content: {
    paddingBottom: Spacing.four,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  card: {
    marginTop: CARD_GAP,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: CARD_GAP,
  },
});
