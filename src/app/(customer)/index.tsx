import { useCallback, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BrandSplash } from '@components/common/brand-splash';
import { useCaptureStoreTag } from '@hooks/use-capture-store-tag';
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
 *
 * 매장 NFC 태그로 들어온 경우에는 주소에 `?store=MCM-SEOUL` 처럼 별도의 매장 코드가 실려
 * 있습니다. 여기서 화면을 떠나면 쿼리가 사라지므로, 스플래시가 도는 동안 `useCaptureStoreTag`
 * 로 코드를 전역 상태(`@stores/store-tag-store`)에 옮겨 둡니다 — 이 코드는 `/login` 화면에
 * 표시하는 용도로만 쓰이고, 위 `storeCode` 와 달리 아직 방문 생성 요청에는 실리지 않습니다.
 */
export default function CustomerEntryScreen() {
  const router = useRouter();
  const { storeCode } = useLocalSearchParams<{ storeCode?: string }>();
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompleted);
  useReportActiveTab(null);
  useCaptureStoreTag();

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
