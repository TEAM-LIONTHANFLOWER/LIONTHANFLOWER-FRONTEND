import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ActionPill } from '@components/common/action-pill';
import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { InitialSetupButton } from '@components/common/initial-setup-button';
import { ScreenContainer } from '@components/common/screen-container';
import { VisitMemoryLink } from '@components/common/visit-memory-link';
import { RecordSummaryCard } from '@components/staff/record-summary-card';
import { toSameText } from '@constants/format';
import {
  RECORD_COMPLETE_CARDS,
  RECORD_COMPLETE_DESCRIPTION,
  RECORD_FLOW_COPY,
  RECORD_REGENERATE_LABEL,
} from '@constants/record-form';
import { FixedColors, FontFamily, LineHeightRatio, Spacing } from '@constants/theme';
import {
  useRegenerateVisitMemory,
  useShareVisitMemory,
  useStaffVisitMemory,
} from '@hooks/use-staff-records';
import { useStaffVisits } from '@hooks/use-staff-visits';
import { useRecordFormStore } from '@stores/record-form-store';
import type { LetterContent } from '@/types/arc';
import type { RecordFlow } from '@/types/record-form';
import type { MemoryCardContent } from '@/types/visit';

/** 상단 줄과 카드 사이, 카드와 버튼 사이. Spacing 스케일에 16 과 24 사이 값이 없어 따로 둡니다. */
const CARD_GAP = 20;

/** 직원 화면은 번역 대상이 아니라 문구를 한국어로 직접 적습니다. */
const LOAD_FAILED = '방금 만든 기록을 불러오지 못했습니다.';
const SHARE_FAILED = '전송하지 못했습니다. 잠시 후 다시 시도해주세요.';
const GENERATING = '글을 쓰는 중입니다...';
const GENERATION_FAILED = '글을 만들지 못했습니다. `다시 생성하기` 를 눌러주세요.';

const STATE_FONT_SIZE = 14;

/**
 * 직원용 기록 작성 완료 화면 — `/staff/record-complete`
 *
 * 방금 쓴 기록을 카드 한 장으로 보여주고, 고칠지 보낼지 고르게 합니다.
 * `flow` 로 어느 기록인지, `visitMemoryId` 로 서버가 만든 어느 기록인지 정합니다.
 *
 * **Visit Memory** 는 이 화면에 오기 전에 서버가 이미 만들어 둡니다. 여기서는 그 글을
 * 그대로 읽어 보여주고, `다시 생성하기` 로 같은 입력에 글만 새로 뽑거나, `전송` 으로
 * 고객에게 보냅니다. 보내면 고객 쪽에 알림이 하나 생깁니다.
 *
 * **Arc** 는 작성 화면의 `NEXT` 에서 생성과 전송이 함께 끝나는 흐름이라, 이 화면에 올 때는
 * 이미 고객에게 간 상태입니다. 그래서 마지막 버튼은 `전송` 이 아니라 `저장` 이고, 고객의 최종
 * 저장(`POST /api/customers/arcs/{arcId}/finalize`)으로 이어집니다. 다만 생성이 아직 막혀 있어
 * (`docs/api-integration.md` 의 "막힌 것" 2) 지금은 데모 카드를 보여주고, `저장` 은 값만 비우고
 * 직원 홈으로 돌아갑니다.
 *
 * `수정` 은 적은 값을 그대로 둔 채 작성 화면의 첫 단계로 되돌립니다 — 값이 스토어에 있어
 * 화면을 새로 열어도 남습니다.
 */
export default function StaffRecordCompleteScreen() {
  const router = useRouter();
  const {
    flow: requestedFlow,
    visitId,
    visitMemoryId,
  } = useLocalSearchParams<{
    flow?: string;
    visitId?: string;
    visitMemoryId?: string;
  }>();

  const flow: RecordFlow = requestedFlow === 'memory' ? 'memory' : 'arc';
  const copy = RECORD_FLOW_COPY[flow];

  const reset = useRecordFormStore((state) => state.reset);

  const memoryId = visitMemoryId ?? null;
  const memory = useStaffVisitMemory(memoryId);
  const { mutate: regenerate, isPending: isRegenerating } = useRegenerateVisitMemory();
  const { mutate: share, isPending: isSharing, isError: isShareError } = useShareVisitMemory();

  // 카드 제목에 쓸 고객 이름. 직원 홈이 이미 받아 둔 목록에서 찾습니다.
  const { data: visits } = useStaffVisits();
  const customerName = visits?.find((visit) => visit.id === visitId)?.name;

  const summary = memory.data?.generatedContent?.summary;
  const title = customerName === undefined ? 'Visit Memory' : `${customerName}’s Visit Memory`;

  const card: MemoryCardContent =
    memoryId === null || summary === undefined
      ? RECORD_COMPLETE_CARDS[flow]
      : { page: 'memory', title, lines: [summary] };

  /** 머리말의 `Visit Memory` 는 방금 만든 글을 그대로 엽니다. */
  const letter: LetterContent | undefined =
    summary === undefined
      ? undefined
      : {
          // 아직 보내지 않은 글이라 매장·날짜 줄이 없습니다.
          title,
          sections: [{ id: 'summary', lines: [toSameText(summary)] }],
        };

  const handleEdit = useCallback(() => {
    router.replace({ pathname: '/staff/record-form', params: { flow, visitId } });
  }, [flow, router, visitId]);

  const handleRegenerate = useCallback(() => {
    if (memoryId === null) {
      return;
    }

    // 같은 입력으로 글만 새로 뽑습니다. 값은 부를 때 한 번만 꺼내면 되어 구독하지 않습니다.
    regenerate({ visitMemoryId: memoryId, values: useRecordFormStore.getState().values[flow] });
  }, [flow, memoryId, regenerate]);

  const leaveToDashboard = useCallback(() => {
    reset(flow);
    // 작성 화면들을 스택에서 걷어내고 직원 홈으로 돌아갑니다.
    router.dismissTo('/staff/dashboard');
  }, [flow, reset, router]);

  const handleSubmit = useCallback(() => {
    if (memoryId === null) {
      leaveToDashboard();
      return;
    }

    share(memoryId, { onSuccess: leaveToDashboard });
  }, [leaveToDashboard, memoryId, share]);

  const isBusy = isRegenerating || isSharing;

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
            <View>{flow === 'memory' ? <VisitMemoryLink letter={letter} /> : null}</View>
            <InitialSetupButton />
          </View>

          <View style={styles.card}>
            {memory.isPending && memoryId !== null ? (
              <ActivityIndicator color={FixedColors.onDark} />
            ) : (
              <RecordSummaryCard
                content={card}
                actionLabel={RECORD_REGENERATE_LABEL}
                onAction={memoryId === null || isBusy ? undefined : handleRegenerate}
              />
            )}
          </View>

          {memory.isError ? (
            <Text style={styles.error} accessibilityRole="alert">
              {LOAD_FAILED}
            </Text>
          ) : null}

          {memory.data?.status === 'GENERATING' ? (
            <Text style={styles.notice}>{GENERATING}</Text>
          ) : null}

          {memory.data?.status === 'FAILED' ? (
            <Text style={styles.error} accessibilityRole="alert">
              {GENERATION_FAILED}
            </Text>
          ) : null}

          {isShareError ? (
            <Text style={styles.error} accessibilityRole="alert">
              {SHARE_FAILED}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <ActionPill label={copy.editLabel} onPress={handleEdit} tone="light" fill />
            <ActionPill
              label={copy.submitLabel}
              onPress={isBusy ? undefined : handleSubmit}
              tone="light"
              fill
            />
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
  error: {
    fontFamily: FontFamily.sans,
    fontSize: STATE_FONT_SIZE,
    lineHeight: STATE_FONT_SIZE * LineHeightRatio.base,
    color: FixedColors.errorOnDark,
    marginTop: Spacing.three,
  },
  notice: {
    fontFamily: FontFamily.sans,
    fontSize: STATE_FONT_SIZE,
    lineHeight: STATE_FONT_SIZE * LineHeightRatio.base,
    color: FixedColors.onDark,
    marginTop: Spacing.three,
  },
});
