import { create } from 'zustand';

import type { NavTabId } from '@/types/navigation';

interface TabState {
  /**
   * 지금 포커스된 탭 화면. `home`/`arc`/`studio` 가 각자 `useFocusEffect` 로 보고합니다.
   *
   * `(customer)/_layout.tsx` 는 이 값을 `expo-router` 의 `usePathname()` 대신 씁니다.
   * `usePathname()`/`useSegments()` 는 `router.replace()` 로 이동한 뒤 다음 네비게이션이
   * 한 번 더 일어나기 전까지 이전 경로에 멈춰 있는 알려진 버그가 있습니다
   * (https://github.com/expo/expo/issues/40193). 탭 화면으로 처음 진입한 뒤 탭을 누르기
   * 전까지는 그 "한 번 더"가 일어나지 않아, 하단 내비게이션이 영영 안 뜨는 문제로 이어집니다.
   * `useFocusEffect` 는 react-navigation 이 화면 포커스 때 직접 호출해 주는 훅이라 이 버그의
   * 영향을 받지 않습니다.
   */
  activeTab: NavTabId | null;
  setActiveTab: (tab: NavTabId | null) => void;
}

export const useTabStore = create<TabState>((set) => ({
  activeTab: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
