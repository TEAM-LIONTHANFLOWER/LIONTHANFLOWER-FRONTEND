import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { PillTabs, type PillTabOption } from '@components/common/pill-tabs';
import { ScreenContainer } from '@components/common/screen-container';
import { ArcRecordCard } from '@components/staff/arc-record-card';
import { DateSection } from '@components/staff/date-section';
import { VisitCard } from '@components/staff/visit-card';
import { Spacing } from '@constants/theme';
import { VISIT_DAYS } from '@constants/visit';
import type { MemoryPage, VisitMode } from '@/types/visit';

/** 시안(393 폭)의 세로 리듬. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
const TABS_TO_LIST = 13;
const DAY_GAP = 25;

const DESCRIPTION = '오늘의 취향과 여정을 담은 브랜드 경험을 만나보세요.';

const MODE_TABS: readonly PillTabOption<VisitMode>[] = [
  { value: 'with', label: 'With' },
  { value: 'solo', label: 'Solo' },
];

/** 직원 홈 화면 — `/staff/dashboard` */
export default function StaffDashboardScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<VisitMode>('with');

  /**
   * 고객 상세는 프로필(Arc)과 방문 기록 두 면을 넘겨 보는 화면입니다.
   * 어느 면을 먼저 열지 액션마다 다르게 넘깁니다.
   *
   * Arc 생성·Visit Memory 저장·응대 시작은 원래 서버에 쓰기 요청을 보내야 하는 동작인데
   * 아직 API 가 없습니다. 지금은 해당 내용을 볼 수 있는 면을 열어 두고,
   * 엔드포인트가 생기면 여기에서 `useMutation` 을 부릅니다.
   */
  const openDetail = useCallback(
    (page: MemoryPage) => {
      router.push({ pathname: '/staff/customer-detail', params: { page } });
    },
    [router]
  );

  return (
    // 배경은 `ScreenContainer` 바깥에 둡니다. 안에 넣으면 안전 영역 안쪽에 갇혀
    // 노치와 홈 인디케이터 자리에 색이 끊깁니다. 자세한 이유는 `screen-container.tsx` 참고.
    <View style={styles.root}>
      <BrandBackdrop />

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
            {VISIT_DAYS.map((day) => {
              const visits = day.visits.filter((visit) => visit.mode === mode);

              // 탭을 바꾸면 고객이 한 명도 없는 날이 생깁니다. 그런 날은 날짜 줄까지 접습니다.
              if (visits.length === 0 && day.arcs.length === 0) {
                return null;
              }

              return (
                <DateSection key={day.date} date={day.date}>
                  {visits.map((visit) => (
                    <VisitCard
                      key={visit.id}
                      visit={visit}
                      onOpen={() => openDetail('arc')}
                      onCreateArc={() => openDetail('arc')}
                      onSaveMemory={() => openDetail('memory')}
                      onStartService={() => openDetail('arc')}
                    />
                  ))}

                  {day.arcs.map((arc) => (
                    <ArcRecordCard key={arc.id} arc={arc} onOpen={() => openDetail('memory')} />
                  ))}
                </DateSection>
              );
            })}
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
});
