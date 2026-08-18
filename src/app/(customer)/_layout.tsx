import { LinearGradient } from 'expo-linear-gradient';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNavBar } from '@components/customer/bottom-nav-bar';
import { FixedColors } from '@constants/theme';
import type { NavTabId } from '@/types/navigation';

/** 하단 탭에 해당하는 화면의 경로. `usePathname()` 값과 짝을 맞춰 둡니다. */
const TAB_PATHNAMES: Record<NavTabId, string> = {
  home: '/home',
  arc: '/arc',
  studio: '/studio',
};

/** 하단 탭 화면이 아니면(로그인·매칭·상품 등) `null` — 그럴 땐 내비게이션을 그리지 않습니다. */
function tabForPathname(pathname: string): NavTabId | null {
  const entry = (Object.entries(TAB_PATHNAMES) as [NavTabId, string][]).find(
    ([, path]) => path === pathname
  );
  return entry?.[0] ?? null;
}

/** 떠 있는 내비게이션이 화면 아래에서 차지하는 높이. 각 탭 화면의 스크롤 여백과 맞춰 둡니다. */
const NAV_AREA_HEIGHT = 118;
/** 스크림 위쪽 끝에서 유리 막대까지의 거리. */
const NAV_BAR_TOP = 16;

/** 위는 투명하고 아래로 갈수록 짙어지는 스크림. */
const TOP = { x: 0.5, y: 0 } as const;
const BOTTOM = { x: 0.5, y: 1 } as const;

/**
 * 고객용 화면 스택.
 * 폴더명이 괄호로 감싸여 있어 URL 에는 `(customer)` 가 나타나지 않습니다.
 * 즉 이 그룹의 index.tsx 가 `/` 입니다.
 *
 * `BottomNavBar` 는 각 탭 화면(`home`/`arc`/`studio`) 안이 아니라 여기, `Stack` 바깥에서
 * 딱 한 번만 마운트합니다. 예전엔 화면마다 각자 그렸는데, 탭을 눌러 다른 화면으로 이동하면
 * 그 화면의 `BottomNavBar` 가 새 인스턴스로 마운트되면서 캡슐이 이미 도착 위치에 그려져
 * 있었습니다 — 캡슐이 반대로 살짝 당겨졌다가 미끄러지는 예비 동작 애니메이션
 * (`bottom-nav-bar.tsx` 의 `ANTICIPATION_OFFSET`) 이 재생될 기회 자체가 없었던 것입니다.
 * 여기서 한 번만 마운트해 두면 화면이 바뀌어도 같은 인스턴스와 같은 `Animated.Value` 가
 * 살아있어, prop 으로 받는 `activeTab` 이 바뀔 때마다 애니메이션이 정상적으로 재생됩니다.
 */
export default function CustomerLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeTab = tabForPathname(pathname);

  const handleTabChange = (tab: NavTabId) => {
    router.navigate(TAB_PATHNAMES[tab]);
  };

  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false }}>
        {/*
          매칭 화면이 로고를 홈의 워드마크 자리까지 옮겨 놓고 넘어옵니다.
          여기서 화면 전환 효과를 한 번 더 주면 방금 맞춰 놓은 로고가 같이 밀려서 어긋나 보입니다.
          자세한 내용은 `matching.tsx` 참고.
        */}
        <Stack.Screen name="home" options={{ animation: 'none' }} />

        {/*
          home / arc / studio 는 서로 화면을 push 하는 관계가 아니라, 하단 `BottomNavBar` 로
          오가는 사실상의 탭입니다. 기본 슬라이드 전환을 쓰면 화면마다 새로 마운트되는 유리
          블러(`BlurView`/`GlassView`) 를 슬라이드 중에 매 프레임 다시 그려야 해서 전환
          애니메이션이 버벅입니다. 탭 전환이라 애초에 슬라이드가 안 어울리기도 해서 끕니다.
        */}
        <Stack.Screen name="arc" options={{ animation: 'none' }} />
        <Stack.Screen name="studio" options={{ animation: 'none' }} />
      </Stack>

      {activeTab === null ? null : (
        <LinearGradient
          colors={[FixedColors.tabBarScrimStart, FixedColors.tabBarScrimEnd]}
          start={TOP}
          end={BOTTOM}
          style={[styles.navScrim, { paddingBottom: insets.bottom }]}
        >
          <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} style={styles.navBar} />
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  navScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: NAV_AREA_HEIGHT,
  },
  navBar: {
    marginTop: NAV_BAR_TOP,
  },
});
