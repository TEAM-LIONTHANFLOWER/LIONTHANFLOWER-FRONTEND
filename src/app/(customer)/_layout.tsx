import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNavBar } from '@components/customer/bottom-nav-bar';
import { FixedColors } from '@constants/theme';
import { useTabStore } from '@stores/tab-store';
import type { NavTabId } from '@/types/navigation';

/** 이 그룹의 첫 화면은 `index`(스플래시) 여야 합니다. 아래 `<Stack>` 의 `Stack.Screen` 선언
 * 순서가 실제 초기 라우트를 결정하는 것과 별개로, 정적 라우트 분석(타입 라우트 등)에도
 * `index` 가 기본값임을 알려 둡니다. */
export const unstable_settings = {
  initialRouteName: 'index',
};

/** 탭을 눌렀을 때 이동할 경로. */
const TAB_PATHNAMES: Record<NavTabId, string> = {
  home: '/home',
  arc: '/arc',
  studio: '/studio',
};

/** 떠 있는 내비게이션이 화면 아래에서 차지하는 높이. 각 탭 화면의 스크롤 여백과 맞춰 둡니다. */
const NAV_AREA_HEIGHT = 118;
/** 스크림 위쪽 끝에서 유리 막대까지의 거리. */
const NAV_BAR_TOP = 28;

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
 *
 * 지금 포커스된 탭은 `expo-router` 의 `usePathname()` 이 아니라 `useTabStore` 에서 읽습니다.
 * `usePathname()`/`useSegments()` 는 `router.replace()` 로 이동한 뒤 다음 네비게이션이 한 번
 * 더 일어나기 전까지 이전 경로를 반환하는 알려진 버그가 있어(expo-router#40193), 로그인 뒤
 * `router.replace('/home')` 로 들어오면 탭을 누르기 전까지 계속 `/` 로 읽혀 내비게이션 바가
 * 영영 안 뜹니다. 각 탭 화면이 `useFocusEffect` 로 스토어에 직접 보고하는 쪽은 이 버그의
 * 영향을 받지 않습니다. 자세한 내용은 `stores/tab-store.ts` 참고.
 */
export default function CustomerLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeTab = useTabStore((state) => state.activeTab);

  const handleTabChange = (tab: NavTabId) => {
    router.navigate(TAB_PATHNAMES[tab]);
  };

  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false }}>
        {/*
          `home`/`arc`/`studio` 를 명시적으로 `Stack.Screen` 으로 선언하면서 `index` 를 암묵적인
          채로 두면, React Navigation 이 초기 라우트를 `index` 가 아니라 명시적으로 선언된 첫
          화면(`home`)으로 잡아버려 앱을 새로 켰을 때 스플래시·온보딩·로그인을 다 건너뛰고
          바로 홈이 뜨는 문제가 있었습니다. `index` 를 맨 앞에 명시적으로 선언해 고정합니다.
        */}
        <Stack.Screen name="index" options={{ animation: 'none' }} />

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
          style={[styles.navScrim, { bottom: insets.bottom }]}
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
    height: NAV_AREA_HEIGHT,
    // Android 는 형제 뷰의 elevation 값으로 그리기 순서를 다시 매길 수 있어서, JSX 순서(이 스크림이
    // Stack 뒤에 옴)와 무관하게 Stack 쪽 elevation 이 더 높으면 화면 내용이 이 스크림을 덮어버릴
    // 수 있습니다. 예방 차원에서 확실히 위로 그려지도록 큰 값을 줍니다. iOS/웹은 영향이 없습니다.
    ...(Platform.OS === 'android' ? { elevation: 24 } : null),
  },
  navBar: {
    marginTop: NAV_BAR_TOP,
  },
});
