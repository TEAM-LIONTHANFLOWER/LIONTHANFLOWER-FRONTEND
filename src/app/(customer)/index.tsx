import { useCallback, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BrandSplash } from '@components/common/brand-splash';
import { useReportActiveTab } from '@hooks/use-report-active-tab';
import { useOnboardingStore } from '@stores/onboarding-store';
import { useStoreCodeStore } from '@stores/store-code-store';

/**
 * 고객용 진입 화면 — `/`
 *
 * 공통 스플래시를 띄운 뒤 온보딩(처음이면) 또는 로그인으로 보냅니다.
 * 직원은 `/staff` 로 들어와 같은 스플래시를 보고 직원 로그인으로 갑니다.
 *
 * 매장마다 다른 QR 코드가 `?storeCode=MCM-PARIS` 처럼 매장 코드를 실어 보내면, 그 값을
 * 여기서 받아 `@stores/store-code-store` 에 담아 둡니다 — `useStartVisit()` 이 방문을 열 때
 * 이 값으로 `POST /api/customers/visits?storeCode=...` 를 불러 이 기기가 속한 매장에
 * 방문을 연결합니다. 쿼리가 없으면 서버가 알아서 기본 매장(`MCM-SEOUL`)으로 엽니다.
 */
export default function CustomerEntryScreen() {
  const router = useRouter();
  const { storeCode } = useLocalSearchParams<{ storeCode?: string }>();
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompleted);
  useReportActiveTab(null);

  useEffect(() => {
    if (storeCode !== undefined) {
      useStoreCodeStore.getState().setStoreCode(storeCode);
    }
  }, [storeCode]);

  const handleSplashFinish = useCallback(() => {
    if (hasCompletedOnboarding) {
      router.replace('/login');
      return;
    }

    router.replace({ pathname: '/onboarding', params: { role: 'customer' } });
  }, [hasCompletedOnboarding, router]);

  return <BrandSplash onFinish={handleSplashFinish} />;
}
