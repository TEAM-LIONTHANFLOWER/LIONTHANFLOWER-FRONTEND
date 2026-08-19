import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ActionPill } from '@components/common/action-pill';
import { BackArrowButton } from '@components/common/back-arrow-button';
import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { InitialSetupButton } from '@components/common/initial-setup-button';
import { ScreenContainer } from '@components/common/screen-container';
import { VisitMemoryLink } from '@components/common/visit-memory-link';
import { MemoryCard } from '@components/staff/memory-card';
import { VISIT_MEMORY_LETTER } from '@constants/arc';
import { toSameText } from '@constants/format';
import { FixedColors, FontFamily, LineHeightRatio, Spacing } from '@constants/theme';
import { toArcCard, useStaffArc } from '@hooks/use-staff-arcs';
import { useStaffVisitMemory } from '@hooks/use-staff-records';
import { toCustomerProfileCard, useStaffVisits } from '@hooks/use-staff-visits';
import { useStoreSearch } from '@hooks/use-stores';
import { useStaffStore } from '@stores/staff-store';
import type { LetterContent } from '@/types/arc';
import type { StaffArcRevision } from '@/types/staff';
import type { MemoryCardContent, StoreVisit } from '@/types/visit';

/** 상단 줄과 카드 사이. Spacing 스케일에 16 과 24 사이 값이 없어 따로 둡니다. */
const TOOLBAR_TO_CARD = 20;

const DESCRIPTION = '오늘의 경험이 새로운 Arc로 기록됩니다.';
const LOAD_FAILED = '고객 정보를 불러오지 못했습니다.';
const NOT_FOUND = '지금 매장에 없는 고객입니다.';
const NO_RECORD = '아직 이 방문의 기록이 없습니다.';

const STATE_FONT_SIZE = 14;

/**
 * 방문 기록 면.
 *
 * 한 방문에는 Arc 나 Visit Memory 중 하나만 딸립니다 — 구매했으면 Arc, 아니면 Visit
 * Memory 입니다. 둘 다 있으면 산 쪽이 그 방문의 기록이라 Arc 를 먼저 봅니다.
 * 아직 아무것도 쓰지 않았으면 빈 카드 대신 그렇게 적어 둡니다.
 */
function toVisitRecordCard(
  visit: StoreVisit,
  arc: StaffArcRevision | undefined,
  memorySummary: string | undefined
): MemoryCardContent {
  if (arc !== undefined) {
    return toArcCard(arc, `${visit.name}’s ${visit.arcLabel}`);
  }

  if (memorySummary !== undefined) {
    return { page: 'memory', title: `${visit.name}’s Visit Memory`, lines: [memorySummary] };
  }

  return { page: 'memory', title: visit.name, lines: [NO_RECORD] };
}

/**
 * 직원용 고객 상세 화면 — `/staff/customer-detail`
 *
 * 고객 프로필과 방문 기록을 카드 한 장씩 좌우로 넘겨 봅니다.
 * `visitId` 로 어느 고객인지, `page` 로 어느 면부터 열지 정합니다.
 * 어느 쪽이든 값이 없거나 모르는 값이면 첫 면부터 엽니다.
 *
 * 프로필 면은 직원 홈이 이미 받아 둔 방문 목록에서 그대로 그립니다 — 고객 한 명을
 * 따로 조회하는 엔드포인트가 없어서인데, 목록에 필요한 값이 다 있어 아쉬울 것이 없습니다.
 * 방문 기록 면도 그 목록에서 시작합니다. 방문 하나가 자기 `arcId` `visitMemoryId` 를 함께
 * 실어 오게 되어(`VisitSummaryResponse`), 그 열쇠로 본문을 불러와 카드에 채웁니다.
 *
 * 머리말과 상단 줄의 구성은 고객 Arc 화면(`(customer)/arc.tsx`)과 같습니다 —
 * `Visit Memory` 는 워드마크 옆, 뒤로 가기 화살표는 알약 탭이 있어야 할 자리입니다.
 */
export default function StaffCustomerDetailScreen() {
  const router = useRouter();
  const { page, visitId } = useLocalSearchParams<{ page?: string; visitId?: string }>();

  const { data: visits, isPending, isError, refetch } = useStaffVisits();

  // 근무 매장은 직원 자신의 프로필에 있습니다. 이름은 매장 목록에서 찾아 붙입니다.
  const storeId = useStaffStore((state) => state.profile?.storeId);
  const { data: stores } = useStoreSearch('');
  const storeName = stores?.find((store) => store.storeId === storeId)?.name;

  const visit = visits?.find((candidate) => candidate.id === visitId);

  // 그 방문에 딸린 기록. 열쇠가 없으면 쿼리가 꺼져 있어 요청이 나가지 않습니다.
  const arc = useStaffArc(visit?.arcId ?? null);
  const memory = useStaffVisitMemory(visit?.visitMemoryId ?? null);
  const memorySummary = memory.data?.generatedContent?.summary;

  const cards: readonly MemoryCardContent[] =
    visit === undefined
      ? []
      : [
          toCustomerProfileCard(visit, storeName),
          toVisitRecordCard(visit, arc.data, memorySummary),
        ];

  /**
   * 머리말의 `Visit Memory` 팝업.
   * 이 방문의 글을 받아 왔으면 그것을 열고, 아직 없으면 시안의 예시를 그대로 보여줍니다.
   */
  const letter: LetterContent =
    visit === undefined || memorySummary === undefined
      ? VISIT_MEMORY_LETTER
      : {
          title: `${visit.name}’s Visit Memory`,
          sections: [{ id: 'summary', lines: [toSameText(memorySummary)] }],
        };

  // 카드는 방문을 받아야 만들어지므로 첫 면은 쿼리에서 바로 읽습니다.
  // 목록을 기다렸다 정하면 그 사이에 자리가 0 으로 굳어 `page=memory` 로 들어와도 앞면이 열립니다.
  const [index, setIndex] = useState(page === 'memory' ? 1 : 0);

  const card = cards[index];
  const isLast = index === cards.length - 1;

  const handlePrevious = useCallback(() => {
    // 첫 면에는 넘길 이전 면이 없습니다. 그때는 상단 줄의 화살표와 같이 화면을 벗어납니다.
    if (index === 0) {
      router.back();
      return;
    }

    setIndex(index - 1);
  }, [index, router]);

  const handleNext = useCallback(() => {
    setIndex((previous) => Math.min(previous + 1, cards.length - 1));
  }, [cards.length]);

  return (
    // 배경은 `ScreenContainer` 바깥에 둡니다. 안에 넣으면 안전 영역 안쪽에 갇혀
    // 노치와 홈 인디케이터 자리에 색이 끊깁니다. 자세한 이유는 `screen-container.tsx` 참고.
    <View style={styles.root}>
      <BrandBackdrop />

      <ScreenContainer backgroundColor="transparent" style={styles.stage}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <BrandIntroHeader
            description={DESCRIPTION}
            accessory={<VisitMemoryLink letter={letter} />}
          />

          <View style={styles.toolbar}>
            <BackArrowButton onPress={() => router.back()} label="고객 목록으로 돌아가기" />
            <InitialSetupButton
              setup={
                visit === undefined
                  ? undefined
                  : {
                      interactionStyle: visit.interactionStyle,
                      serviceLanguage: visit.serviceLanguage,
                    }
              }
            />
          </View>

          <View style={styles.card}>
            {isPending ? <ActivityIndicator color={FixedColors.onDark} /> : null}

            {isError ? (
              <View style={styles.state}>
                <Text style={styles.error} accessibilityRole="alert">
                  {LOAD_FAILED}
                </Text>
                <ActionPill label="다시 시도" tone="outline" onPress={() => refetch()} />
              </View>
            ) : null}

            {isPending || isError || card !== undefined ? null : (
              <Text style={styles.empty}>{NOT_FOUND}</Text>
            )}

            {card === undefined ? null : (
              <MemoryCard
                content={card}
                onPrevious={handlePrevious}
                onNext={isLast ? undefined : handleNext}
              />
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  card: {
    marginTop: TOOLBAR_TO_CARD,
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
