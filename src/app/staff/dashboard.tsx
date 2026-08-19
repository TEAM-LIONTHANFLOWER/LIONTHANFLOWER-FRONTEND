import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ActionPill } from '@components/common/action-pill';
import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { PillTabs, type PillTabOption } from '@components/common/pill-tabs';
import { ScreenContainer } from '@components/common/screen-container';
import { DateSection } from '@components/staff/date-section';
import { VisitCard } from '@components/staff/visit-card';
import { toDotDate } from '@constants/format';
import { FixedColors, FontFamily, LineHeightRatio, Spacing } from '@constants/theme';
import { useAssignVisit, useStaffVisits } from '@hooks/use-staff-visits';
import type { RecordFlow } from '@/types/record-form';
import type { MemoryPage, VisitMode } from '@/types/visit';

/** 시안(393 폭)의 세로 리듬. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
const TABS_TO_LIST = 13;
const DAY_GAP = 25;

/** 직원 화면은 번역 대상이 아니라 문구를 한국어로 직접 적습니다. */
const DESCRIPTION = '오늘의 취향과 여정을 담은 브랜드 경험을 만나보세요.';
const LOAD_FAILED = '방문 목록을 불러오지 못했습니다.';
const EMPTY_WITH = '지금 응대할 고객이 없습니다.';
const EMPTY_SOLO = '혼자 둘러보는 고객이 없습니다.';

const STATE_FONT_SIZE = 14;

const MODE_TABS: readonly PillTabOption<VisitMode>[] = [
  { value: 'with', label: 'With' },
  { value: 'solo', label: 'Solo' },
];

/** 직원 홈 화면 — `/staff/dashboard` */
export default function StaffDashboardScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<VisitMode>('with');

  const { data: visits, isPending, isError, refetch } = useStaffVisits();
  const { mutate: assignVisit } = useAssignVisit();

  /**
   * 고객 상세는 프로필(Arc)과 방문 기록 두 면을 넘겨 보는 화면입니다.
   * 어느 면을 먼저 열지 액션마다 다르게 넘깁니다.
   */
  const openDetail = useCallback(
    (page: MemoryPage) => {
      router.push({ pathname: '/staff/customer-detail', params: { page } });
    },
    [router]
  );

  /** 방문 하나를 기록하러 갑니다. 구매했으면 Arc, 아니면 Visit Memory 를 씁니다. */
  const openRecordForm = useCallback(
    (flow: RecordFlow) => {
      router.push({ pathname: '/staff/record-form', params: { flow } });
    },
    [router]
  );

  /**
   * 응대를 시작하면 서버가 이 직원을 담당자로 배정합니다.
   * 배정이 끝나면 목록이 다시 읽히면서 카드의 상태와 버튼이 바뀝니다.
   */
  const startService = useCallback(
    (visitId: string) => {
      assignVisit(visitId, {
        onSuccess: () => openDetail('arc'),
      });
    },
    [assignVisit, openDetail]
  );

  // 서버는 지금 매장에 들어와 있는 고객만 내려줍니다. 그래서 날짜 묶음은 오늘 하루뿐입니다.
  const today = toDotDate(new Date().toISOString());
  const visibleVisits = (visits ?? []).filter((visit) => visit.mode === mode);

  return (
    // 배경은 `ScreenContainer` 바깥에 둡니다. 안에 넣으면 안전 영역 안쪽에 갇혀
    // 노치와 홈 인디케이터 자리에 색이 끊깁니다. 자세한 이유는 `screen-container.tsx` 참고.
    <View style={styles.root}>
      {/* 직원도 앱에서 처음 만나는 화면이라 고객 홈과 같은 조명을 켭니다. */}
      <BrandBackdrop showLight />

      <ScreenContainer backgroundColor="transparent" style={styles.stage}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <BrandIntroHeader description={DESCRIPTION} />

          <PillTabs
            label="고객을 나누는 기준"
            options={MODE_TABS}
            value={mode}
            onChange={setMode}
            style={styles.tabs}
          />

          <View style={styles.days}>
            {isPending ? (
              <ActivityIndicator color={FixedColors.onDark} style={styles.state} />
            ) : null}

            {isError ? (
              <View style={styles.state}>
                <Text style={styles.error} accessibilityRole="alert">
                  {LOAD_FAILED}
                </Text>
                <ActionPill label="다시 시도" tone="outline" onPress={() => refetch()} />
              </View>
            ) : null}

            {isPending || isError || visibleVisits.length > 0 ? null : (
              <Text style={styles.empty}>{mode === 'with' ? EMPTY_WITH : EMPTY_SOLO}</Text>
            )}

            {visibleVisits.length === 0 ? null : (
              <DateSection date={today}>
                {visibleVisits.map((visit) => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    onOpen={() => openDetail('arc')}
                    onCreateArc={() => openRecordForm('arc')}
                    onSaveMemory={() => openRecordForm('memory')}
                    onStartService={() => startService(visit.id)}
                  />
                ))}
              </DateSection>
            )}
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
  tabs: {
    marginTop: Spacing.four,
  },
  days: {
    marginTop: TABS_TO_LIST,
    gap: DAY_GAP,
  },
  state: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  error: {
    fontFamily: FontFamily.sans,
    fontSize: STATE_FONT_SIZE,
    lineHeight: STATE_FONT_SIZE * LineHeightRatio.base,
    color: FixedColors.errorOnDark,
    textAlign: 'center',
  },
  empty: {
    fontFamily: FontFamily.sans,
    fontSize: STATE_FONT_SIZE,
    lineHeight: STATE_FONT_SIZE * LineHeightRatio.base,
    color: FixedColors.onDark,
    textAlign: 'center',
  },
});
