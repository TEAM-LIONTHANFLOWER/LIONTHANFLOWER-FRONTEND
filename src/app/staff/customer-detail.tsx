import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ActionPill } from '@components/common/action-pill';
import { BackArrowButton } from '@components/common/back-arrow-button';
import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { InitialSetupButton } from '@components/common/initial-setup-button';
import { NextStepLink } from '@components/common/next-step-link';
import { ScreenContainer } from '@components/common/screen-container';
import { VisitMemoryLink } from '@components/common/visit-memory-link';
import { MemoryCard } from '@components/staff/memory-card';
import { VISIT_MEMORY_LETTER } from '@constants/arc';
import { toSameText } from '@constants/format';
import { FixedColors, FontFamily, LineHeightRatio, Spacing } from '@constants/theme';
import { toArcCard, usePreviousArcs, useStaffArc } from '@hooks/use-staff-arcs';
import { useStaffVisitMemory } from '@hooks/use-staff-records';
import { useStaffVisits } from '@hooks/use-staff-visits';
import type { LetterContent } from '@/types/arc';
import type { StaffArcRevision } from '@/types/staff';
import type { MemoryCardContent, StoreVisit } from '@/types/visit';

/** 상단 줄과 카드 사이. Spacing 스케일에 16 과 24 사이 값이 없어 따로 둡니다. */
const TOOLBAR_TO_CARD = 20;

/**
 * 시안(2-1 arc 조회, 393 폭)에서 톱니가 워드마크 위쪽 끝보다 내려와 걸린 거리 — 워드마크 y45, 톱니 y65.
 * Spacing 스케일에 없는 값이라 이름을 붙여 둡니다.
 */
const SETTINGS_TOP = 20;

const DESCRIPTION = '오늘의 경험이 새로운 Arc로 기록됩니다.';
const LOAD_FAILED = '고객 정보를 불러오지 못했습니다.';
const NOT_FOUND = '지금 매장에 없는 고객입니다.';
const NO_RECORD = '아직 이 방문의 기록이 없습니다.';

const BACK_TO_LIST = '고객 목록으로 돌아가기';
const BACK_TO_RECENT = '최근 Arc 로 돌아가기';
const NEXT_LABEL = 'Next';
const NEXT_TO_PREVIOUS = '이전 Arc 보기';

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
 * `visitId` 가 가리키는 방문의 기록으로 시작해, `Next` 로 그 고객의 지난 Arc 를 한 장씩
 * 거슬러 봅니다. 첫 면에서 뒤로 가기 화살표를 누르면 화면을 벗어나고, 지난 Arc 를 보고
 * 있으면 한 장 앞으로 되돌립니다 — 시안(2-1 arc 조회)에도 아래쪽 화살표는 `Next` 뿐입니다.
 *
 * 고객 한 명을 따로 조회하는 엔드포인트가 없어서, 직원 홈이 이미 받아 둔 방문 목록에서
 * 자기 고객을 찾아 시작합니다. 방문 하나가 자기 `arcId` `visitMemoryId` 를 함께 실어 오게
 * 되어(`VisitSummaryResponse`), 그 열쇠로 본문을 불러와 카드에 채웁니다. 지난 Arc 도 같은
 * 목록에서 모읍니다 — 자세한 것과 그 한계는 `usePreviousArcs()` 참고.
 *
 * 지난 Arc 는 늦게 도착해도 첫 면을 막지 않습니다. 못 받아 온 Arc 는 그만큼 넘길 면이
 * 줄어들 뿐이라, 로딩과 실패 안내는 방문 목록 것만 그립니다.
 *
 * 응대 방식과 언어는 카드에 다시 적지 않습니다 — 머리말의 기본설정 톱니가 그대로 들고 있습니다.
 *
 * 머리말과 상단 줄의 구성은 시안(2-1 arc 조회)을 그대로 따릅니다 — 기본설정 톱니는
 * 워드마크 오른쪽 끝에, `Visit Memory` 는 뒤로 가기 화살표와 같은 줄 오른쪽 끝에 걸립니다.
 */
export default function StaffCustomerDetailScreen() {
  const router = useRouter();
  const { visitId } = useLocalSearchParams<{ visitId?: string }>();

  const { data: visits, isPending, isError, refetch } = useStaffVisits();

  const visit = visits?.find((candidate) => candidate.id === visitId);

  // 그 방문에 딸린 기록. 열쇠가 없으면 쿼리가 꺼져 있어 요청이 나가지 않습니다.
  const arc = useStaffArc(visit?.arcId ?? null);
  const memory = useStaffVisitMemory(visit?.visitMemoryId ?? null);
  const memorySummary = memory.data?.generatedContent?.summary;

  const previousArcs = usePreviousArcs(visit);

  /** 넘겨 볼 카드들. 이번 방문의 기록이 맨 앞이고, 그 뒤로 지난 Arc 가 최신순으로 붙습니다. */
  const cards: readonly MemoryCardContent[] =
    visit === undefined
      ? []
      : [toVisitRecordCard(visit, arc.data, memorySummary), ...previousArcs.cards];

  // 지난 Arc 가 하나씩 도착하면서 카드 수가 늘어납니다. 자리가 목록 밖으로 나가지 않게 붙잡습니다.
  const [page, setPage] = useState(0);
  const index = Math.min(page, Math.max(cards.length - 1, 0));
  const card = cards[index];
  const hasPrevious = index < cards.length - 1;

  /** 첫 면에는 되돌아갈 Arc 가 없습니다. 그때만 화면을 벗어납니다. */
  const handleBack = useCallback(() => {
    if (index === 0) {
      router.back();
      return;
    }

    setPage(index - 1);
  }, [index, router]);

  const handleNext = useCallback(() => {
    setPage(index + 1);
  }, [index]);

  /**
   * 상단 줄의 `Visit Memory` 팝업.
   * 이 방문의 글을 받아 왔으면 그것을 열고, 아직 없으면 시안의 예시를 그대로 보여줍니다.
   */
  const letter: LetterContent =
    visit === undefined || memorySummary === undefined
      ? VISIT_MEMORY_LETTER
      : {
          title: `${visit.name}’s Visit Memory`,
          sections: [{ id: 'summary', lines: [toSameText(memorySummary)] }],
        };

  return (
    // 배경은 `ScreenContainer` 바깥에 둡니다. 안에 넣으면 안전 영역 안쪽에 갇혀
    // 노치와 홈 인디케이터 자리에 색이 끊깁니다. 자세한 이유는 `screen-container.tsx` 참고.
    <View style={styles.root}>
      <BrandBackdrop />

      <ScreenContainer backgroundColor="transparent" style={styles.stage}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <BrandIntroHeader
            description={DESCRIPTION}
            // 시안은 워드마크 오른쪽 끝에 톱니 하나만 겁니다.
            accessory={
              <InitialSetupButton
                iconOnly
                style={styles.settings}
                setup={
                  visit === undefined
                    ? undefined
                    : {
                        interactionStyle: visit.interactionStyle,
                        serviceLanguage: visit.serviceLanguage,
                      }
                }
              />
            }
          />

          {/* 시안은 뒤로 가기 화살표와 같은 줄 오른쪽 끝에 `Visit Memory` 를 겁니다. */}
          <View style={styles.toolbar}>
            <BackArrowButton
              onPress={handleBack}
              label={index === 0 ? BACK_TO_LIST : BACK_TO_RECENT}
            />
            <VisitMemoryLink variant="pill" letter={letter} />
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

            {card === undefined ? null : <MemoryCard content={card} />}
          </View>

          {/* 넘길 Arc 가 있을 때만 답니다. 마지막 면에서는 흐려집니다. */}
          {cards.length > 1 ? (
            <NextStepLink
              onPress={handleNext}
              label={NEXT_LABEL}
              accessibilityLabel={NEXT_TO_PREVIOUS}
              disabled={!hasPrevious}
              style={styles.pager}
            />
          ) : null}
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
  settings: {
    marginTop: SETTINGS_TOP,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    // 시안의 상단 줄은 안내 문구 바로 아래(y214)입니다.
    marginTop: Spacing.three,
  },
  card: {
    marginTop: TOOLBAR_TO_CARD,
  },
  // 시안은 카드 아래 13px 지점에서 `Next` 줄을 시작하고, 화살표 끝을 화면 오른쪽에서
  // 38.5px 띄웁니다. 화면 좌우 여백이 24 라 여기서 16 을 더 밀어 그 자리에 맞춥니다.
  pager: {
    marginTop: Spacing.three,
    paddingRight: Spacing.three,
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
