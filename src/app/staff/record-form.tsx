import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { NextStepLink } from '@components/common/next-step-link';
import { ScreenContainer } from '@components/common/screen-container';
import { StepTabs } from '@components/common/step-tabs';
import { RecordSectionField } from '@components/staff/record-section-field';
import { RECORD_FLOW_COPY, RECORD_FORM_DESCRIPTION, RECORD_STEPS } from '@constants/record-form';
import { FixedColors, FontFamily, LineHeightRatio, Spacing } from '@constants/theme';
import {
  findMissingArcField,
  toArcSnapshot,
  useCreateArc,
  useRegenerateArc,
  useShareArc,
} from '@hooks/use-staff-arcs';
import { useCreateVisitMemory } from '@hooks/use-staff-records';
import { useRecordFormStore } from '@stores/record-form-store';
import type { RecordFlow } from '@/types/record-form';
import type { StaffArcRevision } from '@/types/staff';

/** 단계 탭과 첫 입력 사이. Spacing 스케일에 16 과 24 사이 값이 없어 세 칸으로 둡니다. */
const TABS_TO_SECTIONS = Spacing.three;

/**
 * 단계를 옮길 때 입력 묶음이 옆에서 밀려 들어오는 거리와 시간.
 * 다음으로 가면 오른쪽에서, 이전으로 돌아가면 왼쪽에서 들어옵니다.
 */
const STEP_SLIDE = 24;
const STEP_DURATION_MS = 280;

/** 직원 화면은 번역 대상이 아니라 문구를 한국어로 직접 적습니다. */
const SUBMIT_FAILED = '기록을 만들지 못했습니다. 잠시 후 다시 시도해주세요.';
const NO_VISIT = '어느 고객의 기록인지 알 수 없습니다. 직원 홈에서 다시 들어와주세요.';
/** 서버가 빈 값을 받지 않는 칸을 비워 둔 채 마치려 할 때. */
const toMissingFieldMessage = (label: string) => `${label} 칸을 채워주세요.`;

const ERROR_FONT_SIZE = 14;

/**
 * 직원용 기록 작성 화면 — `/staff/record-form`
 *
 * 응대를 마친 방문 하나를 네 단계에 나눠 적습니다.
 * `flow` 쿼리로 어느 기록을 쓸지 정합니다 — 고객이 구매했으면 `arc`, 아니면 `memory` 입니다.
 * 값이 없거나 모르는 값이면 구매한 경우로 봅니다.
 *
 * 단계와 입력 묶음은 `@constants/record-form` 에 데이터로 적혀 있고, 이 화면은 껍데기만
 * 그립니다. 적은 값은 `@stores/record-form-store` 에 담겨, 완료 화면에서 `수정` 으로
 * 돌아와도 그대로 남습니다.
 */
export default function StaffRecordFormScreen() {
  const router = useRouter();
  const {
    arcId,
    flow: requestedFlow,
    visitId,
  } = useLocalSearchParams<{
    arcId?: string;
    flow?: string;
    visitId?: string;
  }>();

  const flow: RecordFlow = requestedFlow === 'memory' ? 'memory' : 'arc';
  const steps = RECORD_STEPS[flow];
  const copy = RECORD_FLOW_COPY[flow];

  const [index, setIndex] = useState(0);

  const {
    mutate: createVisitMemory,
    isPending: isCreatingMemory,
    isError: isMemoryError,
  } = useCreateVisitMemory();
  const { mutate: createArc, isPending: isCreatingArc, isError: isArcError } = useCreateArc();
  const {
    mutate: regenerateArc,
    isPending: isRegeneratingArc,
    isError: isArcRegenerateError,
  } = useRegenerateArc();
  const { mutate: shareArc, isPending: isSharingArc } = useShareArc();

  // 서버가 무엇이 빠졌는지 알려주지 않아, 보내기 전에 앱이 먼저 걸러 이름을 적어 줍니다.
  const [missingField, setMissingField] = useState<string | undefined>(undefined);

  const isPending = isCreatingMemory || isCreatingArc || isRegeneratingArc || isSharingArc;
  const isError = isMemoryError || isArcError || isArcRegenerateError;

  const step = steps[index];
  const isLast = index === steps.length - 1;

  // 지연 초기화로 한 번만 만들고, 이후에는 애니메이션으로만 값을 바꿉니다.
  const [enter] = useState(() => new Animated.Value(1));
  const previousIndex = useRef(index);
  // 어느 쪽에서 들어올지는 그리는 시점에 정해야 합니다. 효과가 도는 건 그린 뒤라 한 박자 늦습니다.
  const slideFrom = (index >= previousIndex.current ? 1 : -1) * STEP_SLIDE;

  useEffect(() => {
    previousIndex.current = index;
    enter.setValue(0);

    const animation = Animated.timing(enter, {
      toValue: 1,
      duration: STEP_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [enter, index]);

  const tabs = useMemo(
    () => steps.map((candidate) => ({ value: candidate.id, label: candidate.label })),
    [steps]
  );

  const handleStepChange = useCallback(
    (stepId: string) => {
      const next = steps.findIndex((candidate) => candidate.id === stepId);

      if (next !== -1) {
        setIndex(next);
      }
    },
    [steps]
  );

  /**
   * 마지막 단계에서 `NEXT` 를 누르면 서버가 기록을 만듭니다.
   *
   * **Visit Memory** 는 이때 글까지 써서 돌아옵니다 — 완료 화면이 그 글을 보여주고,
   * 거기서 `전송` 을 눌러야 비로소 고객에게 갑니다.
   *
   * **Arc** 는 여기서 생성(`POST /api/staff/visits/{visitId}/arcs`, 완료 화면에서 `수정` 으로
   * 돌아왔으면 새 리비전 `POST /api/staff/arcs/{arcId}/revisions`)과
   * 전송(`POST /api/staff/arcs/{arcId}/revisions/{revisionId}/share`)을 이어서 부릅니다.
   * 완료 화면은 이미 고객에게 간 Arc 를 보여주는 자리이고, 그래서 그 화면의 마지막
   * 버튼이 전송이 아니라 `저장` 입니다.
   *
   * 편지를 아직 쓰는 중이면(`GENERATING`) 여기서 보낼 수 없어 완료 화면으로 넘깁니다 —
   * 다 써지는 것을 지켜보다 보내는 일은 그 화면이 이어받습니다. 전송이 실패했을 때도
   * 마찬가지로 넘깁니다. 여기서 붙잡아 두면 다시 눌렀을 때 Arc 가 한 벌 더 생깁니다.
   */
  const handleNext = useCallback(() => {
    if (!isLast) {
      setIndex((previous) => previous + 1);
      return;
    }

    if (visitId === undefined) {
      return;
    }

    // 값은 보낼 때 한 번만 꺼냅니다. 구독하면 글자를 칠 때마다 이 화면이 통째로 다시 그려집니다 —
    // 묶음마다 자기 값만 구독하는 `RecordSectionField` 의 이점이 사라집니다.
    const values = useRecordFormStore.getState().values[flow];

    if (flow === 'memory') {
      createVisitMemory(
        { visitId, values },
        {
          onSuccess: (memory) => {
            router.push({
              pathname: '/staff/record-complete',
              params: { flow, visitId, visitMemoryId: memory.visitMemoryId },
            });
          },
        }
      );
      return;
    }

    const missing = findMissingArcField(toArcSnapshot(values));
    setMissingField(missing);

    if (missing !== undefined) {
      return;
    }

    const onSaved = (arc: StaffArcRevision) => {
      const goToComplete = () =>
        router.push({
          pathname: '/staff/record-complete',
          params: { flow, visitId, arcId: arc.arcId },
        });

      if (arc.revisionStatus !== 'READY') {
        goToComplete();
        return;
      }

      shareArc({ arcId: arc.arcId, revisionId: arc.revisionId }, { onSettled: goToComplete });
    };

    // 완료 화면에서 `수정` 으로 돌아왔으면 이미 만든 Arc 가 있습니다 — 새 Arc 를 만드는 대신
    // 그 Arc 에 새 리비전을 얹습니다.
    if (arcId !== undefined) {
      regenerateArc({ arcId, values }, { onSuccess: onSaved });
      return;
    }

    createArc({ visitId, values }, { onSuccess: onSaved });
  }, [arcId, createArc, createVisitMemory, flow, isLast, regenerateArc, router, shareArc, visitId]);

  return (
    // 배경은 `ScreenContainer` 바깥에 둡니다. 안에 넣으면 안전 영역 안쪽에 갇혀
    // 노치와 홈 인디케이터 자리에 색이 끊깁니다. 자세한 이유는 `screen-container.tsx` 참고.
    <View style={styles.root}>
      <BrandBackdrop />

      <ScreenContainer backgroundColor="transparent" style={styles.stage}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <BrandIntroHeader description={RECORD_FORM_DESCRIPTION} />

          <StepTabs
            label={`${copy.title} 단계`}
            options={tabs}
            value={step.id}
            onChange={handleStepChange}
            style={styles.tabs}
          />

          <Animated.View
            style={[
              styles.sections,
              {
                opacity: enter,
                transform: [
                  {
                    translateX: enter.interpolate({
                      inputRange: [0, 1],
                      outputRange: [slideFrom, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {step.sections.map((section) => (
              <RecordSectionField key={section.id} flow={flow} section={section} />
            ))}
          </Animated.View>

          {isLast && visitId === undefined ? (
            <Text style={styles.error} accessibilityRole="alert">
              {NO_VISIT}
            </Text>
          ) : null}

          {missingField === undefined ? null : (
            <Text style={styles.error} accessibilityRole="alert">
              {toMissingFieldMessage(missingField)}
            </Text>
          )}

          {isError ? (
            <Text style={styles.error} accessibilityRole="alert">
              {SUBMIT_FAILED}
            </Text>
          ) : null}

          <NextStepLink
            accessibilityLabel={isLast ? `${copy.title} 마치기` : '다음 단계'}
            disabled={isPending}
            onPress={handleNext}
            style={styles.next}
          />
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
  tabs: {
    marginTop: Spacing.four,
  },
  sections: {
    marginTop: TABS_TO_SECTIONS,
    gap: Spacing.four,
  },
  next: {
    marginTop: Spacing.five,
  },
  error: {
    fontFamily: FontFamily.sans,
    fontSize: ERROR_FONT_SIZE,
    lineHeight: ERROR_FONT_SIZE * LineHeightRatio.base,
    color: FixedColors.errorOnDark,
    marginTop: Spacing.four,
  },
});
