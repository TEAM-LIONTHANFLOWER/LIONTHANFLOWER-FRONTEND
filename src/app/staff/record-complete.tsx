import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { LetterContent } from '@/types/arc';
import type { RecordFlow } from '@/types/record-form';
import type { MemoryCardContent } from '@/types/visit';
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
import { toArcCard, useRegenerateArc, useShareArc, useStaffArc } from '@hooks/use-staff-arcs';
import {
  useRegenerateVisitMemory,
  useShareVisitMemory,
  useStaffVisitMemory,
} from '@hooks/use-staff-records';
import { useStaffVisits } from '@hooks/use-staff-visits';
import { useRecordFormStore } from '@stores/record-form-store';

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
 * 방금 쓴 기록을 카드 한 장으로 보여주고, 고칠지 마칠지 고르게 합니다.
 * `flow` 로 어느 기록인지, `visitMemoryId` / `arcId` 로 서버가 만든 어느 기록인지 정합니다.
 *
 * **Visit Memory** 는 이 화면에 오기 전에 서버가 이미 만들어 둡니다. 여기서는 그 글을
 * 그대로 읽어 보여주고, `다시 생성하기` 로 같은 입력에 글만 새로 뽑거나, `전송` 으로
 * 고객에게 보냅니다. 보내면 고객 쪽에 알림이 하나 생깁니다.
 *
 * **Arc** 는 작성 화면의 `NEXT` 에서 생성과 전송이 함께 끝나는 흐름이라, 이 화면에 올 때는
 * 이미 고객에게 간 상태입니다. 아직 못 보낸 채로 넘어왔으면(편지를 쓰는 중이었거나 전송이
 * 한 번 실패했으면) 이 화면이 마저 보냅니다. `다시 생성하기` 는 같은 Arc 에 새 리비전을
 * 얹고, 그 리비전이 다 써지는 대로 다시 보냅니다 — 고객은 늘 최신 편지를 봅니다.
 *
 * 마지막 버튼은 그래서 전송이 아니라 `저장` 이고, **여기서는 아무 요청도 하지 않습니다.**
 * 고객 Arc 최종 저장(`POST /api/customers/arcs/{arcId}/finalize`)은 고객 토큰으로만 되는
 * 고객 쪽 행동이라, 직원은 값을 비우고 직원 홈으로 돌아가기만 합니다. 이미 전송된 Arc 는
 * 서버에 남아 있어 이 화면을 떠나도 사라지지 않습니다.
 *
 * `수정` 은 적은 값을 그대로 둔 채 작성 화면의 첫 단계로 되돌립니다 — 값이 스토어에 있어
 * 화면을 새로 열어도 남습니다. 이때 이미 만든 기록의 열쇠(`arcId` / `visitMemoryId`)를
 * 함께 넘겨, 다시 마칠 때 기록이 새로 생기지 않고 있던 것이 고쳐지게 합니다.
 */
export default function StaffRecordCompleteScreen() {
  const router = useRouter();
  const {
    arcId,
    flow: requestedFlow,
    visitId,
    visitMemoryId,
  } = useLocalSearchParams<{
    arcId?: string;
    flow?: string;
    visitId?: string;
    visitMemoryId?: string;
  }>();

  const flow: RecordFlow = requestedFlow === 'memory' ? 'memory' : 'arc';
  const copy = RECORD_FLOW_COPY[flow];

  const reset = useRecordFormStore((state) => state.reset);

  // 흐름마다 자기 기록만 읽습니다. 상대 흐름의 열쇠는 `null` 이라 요청이 나가지 않습니다.
  const memoryId = flow === 'memory' ? (visitMemoryId ?? null) : null;
  const currentArcId = flow === 'arc' ? (arcId ?? null) : null;

  const memory = useStaffVisitMemory(memoryId);
  const arc = useStaffArc(currentArcId);

  const { mutate: regenerateMemory, isPending: isRegeneratingMemory } = useRegenerateVisitMemory();
  const {
    mutate: shareMemory,
    isPending: isSharingMemory,
    isError: isMemoryShareError,
  } = useShareVisitMemory();
  const { mutate: regenerateArc, isPending: isRegeneratingArc } = useRegenerateArc();
  const { mutate: shareArc, isPending: isSharingArc, isError: isArcShareError } = useShareArc();

  // 카드 제목에 쓸 고객 이름과 몇 번째 Arc 인지. 직원 홈이 이미 받아 둔 목록에서 찾습니다.
  const { data: visits } = useStaffVisits();
  const visit = visits?.find((candidate) => candidate.id === visitId);
  const customerName = visit?.name;

  /**
   * 아직 고객에게 못 간 리비전을 보냅니다.
   *
   * 작성 화면이 편지가 다 써지기 전에 넘겼거나 전송이 한 번 실패한 경우, 그리고
   * `다시 생성하기` 로 새 리비전이 생긴 경우입니다. **리비전 하나에 한 번만** 시도합니다 —
   * 실패한 전송을 폴링 때마다 다시 부르면 멈추지 않습니다.
   */
  const attemptedRevisions = useRef(new Set<string>());

  useEffect(() => {
    const pending = arc.data;

    if (pending === undefined || attemptedRevisions.current.has(pending.revisionId)) {
      return;
    }
    if (pending.arcStatus !== 'DRAFT' || pending.revisionStatus !== 'READY') {
      return;
    }

    attemptedRevisions.current.add(pending.revisionId);
    shareArc({ arcId: pending.arcId, revisionId: pending.revisionId });
  }, [arc.data, shareArc]);

  const memorySummary = memory.data?.generatedContent?.summary;
  const memoryTitle =
    customerName === undefined ? 'Visit Memory' : `${customerName}’s Visit Memory`;
  const arcTitle =
    customerName === undefined || visit === undefined
      ? 'Arc'
      : `${customerName}’s ${visit.arcLabel}`;

  const card: MemoryCardContent = (() => {
    if (flow === 'arc') {
      return arc.data === undefined ? RECORD_COMPLETE_CARDS.arc : toArcCard(arc.data, arcTitle);
    }

    return memorySummary === undefined
      ? RECORD_COMPLETE_CARDS.memory
      : { page: 'memory', title: memoryTitle, lines: [memorySummary] };
  })();

  /** 머리말의 `Visit Memory` 는 방금 만든 글을 그대로 엽니다. */
  const letter: LetterContent | undefined =
    memorySummary === undefined
      ? undefined
      : {
          // 아직 보내지 않은 글이라 매장·날짜 줄이 없습니다.
          title: memoryTitle,
          sections: [{ id: 'summary', lines: [toSameText(memorySummary)] }],
        };

  const handleEdit = useCallback(() => {
    // 이미 만든 기록을 들고 돌아갑니다 — 작성 화면이 이 열쇠를 보고 새로 만드는 대신 고쳐 씁니다.
    // Arc 에는 새 리비전이 얹히고, Visit Memory 는 고친 입력으로 글을 다시 씁니다.
    const params: Record<string, string> = { flow };

    if (visitId !== undefined) {
      params.visitId = visitId;
    }
    if (currentArcId !== null) {
      params.arcId = currentArcId;
    }
    if (memoryId !== null) {
      params.visitMemoryId = memoryId;
    }

    router.replace({ pathname: '/staff/record-form', params });
  }, [currentArcId, flow, memoryId, router, visitId]);

  const handleRegenerate = useCallback(() => {
    // 같은 입력으로 글만 새로 뽑습니다. 값은 부를 때 한 번만 꺼내면 되어 구독하지 않습니다.
    const values = useRecordFormStore.getState().values[flow];

    if (flow === 'arc') {
      if (currentArcId !== null) {
        // 새 리비전을 고객에게 보내는 일은 위 효과가 이어받습니다.
        regenerateArc({ arcId: currentArcId, values });
      }
      return;
    }

    if (memoryId !== null) {
      regenerateMemory({ visitMemoryId: memoryId, values });
    }
  }, [currentArcId, flow, memoryId, regenerateArc, regenerateMemory]);

  const leaveToDashboard = useCallback(() => {
    reset(flow);
    // 작성 화면들을 스택에서 걷어내고 직원 홈으로 돌아갑니다.
    router.dismissTo('/staff/dashboard');
  }, [flow, reset, router]);

  const handleSubmit = useCallback(() => {
    // Arc 의 `저장` 은 부를 요청이 없습니다 — 편지는 이미 고객에게 가 있고,
    // 최종 저장은 고객이 자기 화면에서 합니다.
    if (flow === 'arc' || memoryId === null) {
      leaveToDashboard();
      return;
    }

    shareMemory(memoryId, { onSuccess: leaveToDashboard });
  }, [flow, leaveToDashboard, memoryId, shareMemory]);

  const record = flow === 'arc' ? arc : memory;
  const recordId = flow === 'arc' ? currentArcId : memoryId;
  const generationStatus = flow === 'arc' ? arc.data?.revisionStatus : memory.data?.status;
  const isShareError = flow === 'arc' ? isArcShareError : isMemoryShareError;
  // 열쇠가 없으면 쿼리가 꺼져 있고, 꺼진 쿼리는 늘 `isPending` 입니다 — 그것까지 세면 버튼이 잠깁니다.
  const isLoadingRecord = recordId !== null && record.isPending;
  const isBusy =
    isRegeneratingArc || isRegeneratingMemory || isSharingArc || isSharingMemory || isLoadingRecord;

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
            {isLoadingRecord ? (
              <ActivityIndicator color={FixedColors.onDark} />
            ) : (
              <RecordSummaryCard
                content={card}
                actionLabel={RECORD_REGENERATE_LABEL}
                onAction={recordId === null || isBusy ? undefined : handleRegenerate}
              />
            )}
          </View>

          {record.isError ? (
            <Text style={styles.error} accessibilityRole="alert">
              {LOAD_FAILED}
            </Text>
          ) : null}

          {generationStatus === 'GENERATING' ? (
            <Text style={styles.notice}>{GENERATING}</Text>
          ) : null}

          {generationStatus === 'FAILED' ? (
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
