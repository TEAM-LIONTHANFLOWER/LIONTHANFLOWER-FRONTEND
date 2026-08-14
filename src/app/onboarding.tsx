import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingPagination } from '@components/common/onboarding-pagination';
import { OnboardingSlideView } from '@components/common/onboarding-slide';
import { ONBOARDING_SLIDES } from '@constants/onboarding';
import { BrandColors, Spacing } from '@constants/theme';
import { useOnboardingStore } from '@stores/onboarding-store';
import type { EntryRole } from '@/types/onboarding';

/**
 * 고객·직원 공통 온보딩 — `/onboarding`
 *
 * 진입 경로(`/` 또는 `/staff`)를 `role` 쿼리로 받아, 끝난 뒤 해당 역할의 로그인으로 보냅니다.
 * 쿼리로 넘기는 이유는 웹에서 새로고침해도 값이 살아있어야 하기 때문입니다.
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: EntryRole }>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useOnboardingStore((state) => state.complete);

  const scrollRef = useRef<ScrollView>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const lastWidth = useRef(width);

  // 회전하거나 웹 창 크기가 바뀌면 보고 있던 슬라이드로 다시 맞춥니다.
  // 너비가 그대로일 때는 건드리지 않습니다 — 진행 중인 스크롤 애니메이션이 끊깁니다.
  useEffect(() => {
    if (lastWidth.current === width) return;

    lastWidth.current = width;
    scrollRef.current?.scrollTo({ x: slideIndex * width, animated: false });
  }, [slideIndex, width]);

  const goToSlide = useCallback(
    (nextIndex: number) => {
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setSlideIndex(nextIndex);
    },
    [width]
  );

  const handleFinish = useCallback(() => {
    completeOnboarding();
    router.replace(role === 'staff' ? '/staff/login' : '/login');
  }, [completeOnboarding, role, router]);

  const handleNext = useCallback(() => {
    if (slideIndex >= ONBOARDING_SLIDES.length - 1) {
      handleFinish();
      return;
    }
    goToSlide(slideIndex + 1);
  }, [goToSlide, handleFinish, slideIndex]);

  const handlePrevious = useCallback(() => {
    if (slideIndex <= 0) return;
    goToSlide(slideIndex - 1);
  }, [goToSlide, slideIndex]);

  // 손으로 넘겼을 때도 인디케이터를 맞춰줍니다.
  // `onMomentumScrollEnd` 는 웹에서 동작이 일정하지 않아 스크롤 위치로 직접 계산합니다.
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (width <= 0) return;

      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      setSlideIndex((current) => (current === nextIndex ? current : nextIndex));
    },
    [width]
  );

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {ONBOARDING_SLIDES.map((slide, index) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            <OnboardingSlideView
              slide={slide}
              onExplore={handleFinish}
              onNext={handleNext}
              onPrevious={index > 0 ? handlePrevious : undefined}
            />
          </View>
        ))}
      </ScrollView>

      <OnboardingPagination
        count={ONBOARDING_SLIDES.length}
        activeIndex={slideIndex}
        style={[styles.pagination, { top: insets.top + Spacing.two }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.splashBackground,
  },
  slide: {
    flex: 1,
  },
  // 슬라이드와 함께 움직이지 않도록 페이저 위에 고정해 둡니다.
  pagination: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
