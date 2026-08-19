import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { BrandSplash } from '@components/common/brand-splash';
import { useStaffProfile } from '@hooks/use-staff-profile';
import { useOnboardingStore } from '@stores/onboarding-store';
import { useStaffStore } from '@stores/staff-store';

/**
 * 직원용 진입 화면 — `/staff`
 *
 * 고객 진입(`/`)과 같은 스플래시를 쓰고, 이어지는 화면만 직원용으로 갈라집니다.
 *
 * 스플래시가 도는 동안 `staffToken` 쿠키가 아직 살아 있는지 서버에 물어봅니다. 쿠키 값은
 * 앱이 읽을 수 없어서, 프로필 조회가 통하는지 보는 것이 토큰이 있는지 아는 유일한 방법입니다.
 * 통하면 로그인을 건너뛰고 바로 대시보드로 갑니다.
 */
export default function StaffEntryScreen() {
  const router = useRouter();
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompleted);
  const signIn = useStaffStore((state) => state.signIn);
  const { data: profile, isPending: isCheckingSession } = useStaffProfile();

  // 스플래시와 세션 확인이 따로 끝나므로, 끝났다는 사실만 남겨 두고 이동은 아래 훅에서 합니다.
  const [hasSplashFinished, setHasSplashFinished] = useState(false);
  const handleSplashFinish = useCallback(() => setHasSplashFinished(true), []);

  useEffect(() => {
    // 둘 다 끝나야 어디로 갈지 정해집니다. 쿠키가 없으면 401 이고 4xx 는 재시도하지 않아,
    // 세션 확인은 보통 스플래시보다 먼저 끝납니다.
    if (!hasSplashFinished || isCheckingSession) {
      return;
    }

    // 토큰이 살아 있습니다. 받아 온 프로필을 스토어에 넣고 가야 뒤따르는 화면이
    // `storeId` 와 `staffId` 를 읽을 수 있습니다 — 로그인 화면이 하던 일을 대신합니다.
    if (profile) {
      signIn(profile);
      router.replace('/staff/dashboard');
      return;
    }

    // 온보딩 완료 여부는 메모리에만 있어 앱을 껐다 켜면 지워집니다. 그래서 쿠키를 먼저 봅니다 —
    // 이미 일하던 직원에게 온보딩을 다시 보여주지 않으려는 것입니다.
    if (hasCompletedOnboarding) {
      router.replace('/staff/login');
      return;
    }

    router.replace({ pathname: '/onboarding', params: { role: 'staff' } });
  }, [hasCompletedOnboarding, hasSplashFinished, isCheckingSession, profile, router, signIn]);

  return <BrandSplash onFinish={handleSplashFinish} />;
}
