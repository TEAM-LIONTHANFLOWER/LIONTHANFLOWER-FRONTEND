import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { BrandSplash } from '@components/common/brand-splash';
import { useOnboardingStore } from '@stores/onboarding-store';

/**
 * 고객용 진입 화면 — `/`
 *
 * 공통 스플래시를 띄운 뒤 온보딩(처음이면) 또는 로그인으로 보냅니다.
 * 직원은 `/staff` 로 들어와 같은 스플래시를 보고 직원 로그인으로 갑니다.
 */
export default function CustomerEntryScreen() {
  const router = useRouter();
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompleted);

  const handleSplashFinish = useCallback(() => {
    if (hasCompletedOnboarding) {
      router.replace('/login');
      return;
    }

    router.replace({ pathname: '/onboarding', params: { role: 'customer' } });
  }, [hasCompletedOnboarding, router]);

  return <BrandSplash onFinish={handleSplashFinish} />;
}
