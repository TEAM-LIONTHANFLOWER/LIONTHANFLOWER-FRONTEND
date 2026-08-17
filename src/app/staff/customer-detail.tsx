import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BackArrowButton } from '@components/common/back-arrow-button';
import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { InitialSetupButton } from '@components/common/initial-setup-button';
import { ScreenContainer } from '@components/common/screen-container';
import { VisitMemoryLink } from '@components/common/visit-memory-link';
import { MemoryCard } from '@components/staff/memory-card';
import { Spacing } from '@constants/theme';
import { MEMORY_CARDS } from '@constants/visit';

/** 상단 줄과 카드 사이. Spacing 스케일에 16 과 24 사이 값이 없어 따로 둡니다. */
const TOOLBAR_TO_CARD = 20;

const DESCRIPTION = '오늘의 경험이 새로운 Arc로 기록됩니다.';

/**
 * 직원용 고객 상세 화면 — `/staff/customer-detail`
 *
 * 고객 프로필과 방문 기록을 카드 한 장씩 좌우로 넘겨 봅니다.
 * `page` 쿼리로 어느 면부터 열지 정합니다. 값이 없거나 모르는 값이면 첫 면부터 엽니다.
 *
 * 머리말과 상단 줄의 구성은 고객 Arc 화면(`(customer)/arc.tsx`)과 같습니다 —
 * `Visit Memory` 는 워드마크 옆, 뒤로 가기 화살표는 알약 탭이 있어야 할 자리입니다.
 */
export default function StaffCustomerDetailScreen() {
  const router = useRouter();
  const { page } = useLocalSearchParams<{ page?: string }>();

  const requestedIndex = MEMORY_CARDS.findIndex((card) => card.page === page);
  const [index, setIndex] = useState(requestedIndex === -1 ? 0 : requestedIndex);

  const isLast = index === MEMORY_CARDS.length - 1;

  const handlePrevious = useCallback(() => {
    // 첫 면에는 넘길 이전 면이 없습니다. 그때는 상단 줄의 화살표와 같이 화면을 벗어납니다.
    if (index === 0) {
      router.back();
      return;
    }

    setIndex(index - 1);
  }, [index, router]);

  const handleNext = useCallback(() => {
    setIndex((previous) => Math.min(previous + 1, MEMORY_CARDS.length - 1));
  }, []);

  return (
    // 배경은 `ScreenContainer` 바깥에 둡니다. 안에 넣으면 안전 영역 안쪽에 갇혀
    // 노치와 홈 인디케이터 자리에 색이 끊깁니다. 자세한 이유는 `screen-container.tsx` 참고.
    <View style={styles.root}>
      <BrandBackdrop />

      <ScreenContainer backgroundColor="transparent" style={styles.stage}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <BrandIntroHeader description={DESCRIPTION} accessory={<VisitMemoryLink />} />

          <View style={styles.toolbar}>
            <BackArrowButton onPress={() => router.back()} label="고객 목록으로 돌아가기" />
            <InitialSetupButton />
          </View>

          <View style={styles.card}>
            <MemoryCard
              content={MEMORY_CARDS[index]}
              onPrevious={handlePrevious}
              onNext={isLast ? undefined : handleNext}
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
    marginTop: TOOLBAR_TO_CARD,
  },
});
