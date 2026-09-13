import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { BrandSplash } from '@components/common/brand-splash';
import { useCaptureStoreTag } from '@hooks/use-capture-store-tag';
import { useReportActiveTab } from '@hooks/use-report-active-tab';
import { useOnboardingStore } from '@stores/onboarding-store';

/**
 * 고객용 진입 화면 — `/`
 *
 * 공통 스플래시를 띄운 뒤 온보딩(처음이면) 또는 로그인으로 보냅니다.
 * 직원은 `/staff` 로 들어와 같은 스플래시를 보고 직원 로그인으로 갑니다.
 *
 * 매장 NFC 태그로 들어온 경우 주소에 매장 코드가 실려 있습니다. 여기서 화면을 떠나면 쿼리가
 * 사라지므로, 스플래시가 도는 동안 코드를 전역 상태로 옮겨 둡니다.
 */
export default function CustomerEntryScreen() {
  const router = useRouter();
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompleted);
  useReportActiveTab(null);
  useCaptureStoreTag();

  const handleSplashFinish = useCallback(() => {
    if (hasCompletedOnboarding) {
      router.replace('/login');
      return;
    }

    router.replace({ pathname: '/onboarding', params: { role: 'customer' } });
  }, [hasCompletedOnboarding, router]);

  return <BrandSplash onFinish={handleSplashFinish} />;
}
