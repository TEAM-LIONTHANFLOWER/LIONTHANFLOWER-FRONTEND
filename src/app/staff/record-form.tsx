import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { NextStepLink } from '@components/common/next-step-link';
import { ScreenContainer } from '@components/common/screen-container';
import { StepTabs } from '@components/common/step-tabs';
import { RecordSectionField } from '@components/staff/record-section-field';
import { RECORD_FLOW_COPY, RECORD_FORM_DESCRIPTION, RECORD_STEPS } from '@constants/record-form';
import { Spacing } from '@constants/theme';
import type { RecordFlow } from '@/types/record-form';

/** 단계 탭과 첫 입력 사이. Spacing 스케일에 16 과 24 사이 값이 없어 세 칸으로 둡니다. */
const TABS_TO_SECTIONS = Spacing.three;

/**
 * 단계를 옮길 때 입력 묶음이 옆에서 밀려 들어오는 거리와 시간.
 * 다음으로 가면 오른쪽에서, 이전으로 돌아가면 왼쪽에서 들어옵니다.
 */
const STEP_SLIDE = 24;
const STEP_DURATION_MS = 280;

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
  const { flow: requestedFlow } = useLocalSearchParams<{ flow?: string }>();

  const flow: RecordFlow = requestedFlow === 'memory' ? 'memory' : 'arc';
  const steps = RECORD_STEPS[flow];
  const copy = RECORD_FLOW_COPY[flow];

  const [index, setIndex] = useState(0);

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

  const handleNext = useCallback(() => {
    if (isLast) {
      router.push({ pathname: '/staff/record-complete', params: { flow } });
      return;
    }

    setIndex((previous) => previous + 1);
  }, [flow, isLast, router]);

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

          <NextStepLink
            accessibilityLabel={isLast ? `${copy.title} 마치기` : '다음 단계'}
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
});
