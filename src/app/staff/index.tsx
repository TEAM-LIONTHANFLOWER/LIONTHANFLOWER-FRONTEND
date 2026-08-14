import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { BrandSplash } from '@components/common/brand-splash';
import { useOnboardingStore } from '@stores/onboarding-store';

/**
 * 직원용 진입 화면 — `/staff`
 *
 * 고객 진입(`/`)과 같은 스플래시를 쓰고, 이어지는 화면만 직원용으로 갈라집니다.
 */
export default function StaffEntryScreen() {
  const router = useRouter();
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompleted);

  const handleSplashFinish = useCallback(() => {
    if (hasCompletedOnboarding) {
      router.replace('/staff/login');
      return;
    }

    router.replace({ pathname: '/onboarding', params: { role: 'staff' } });
  }, [hasCompletedOnboarding, router]);

  return <BrandSplash onFinish={handleSplashFinish} />;
}
