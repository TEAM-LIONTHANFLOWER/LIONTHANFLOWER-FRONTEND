import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import { useTabStore } from '@stores/tab-store';
import type { NavTabId } from '@/types/navigation';

/**
 * `(customer)` 그룹의 각 화면이 포커스됐을 때 `useTabStore` 에 자신을 보고합니다.
 * 탭 화면(`home`/`arc`/`studio`)은 자기 id 를, 그 외(로그인·매칭·상품·진입) 는 `null` 을 넘겨
 * 내비게이션이 그려지지 않게 합니다. 이유는 `stores/tab-store.ts` 참고.
 *
 * focus 시에만 값을 쓰고, blur 시 cleanup 으로 지우지는 않습니다. 두 탭을 오갈 때 이전 화면의
 * blur cleanup 과 다음 화면의 focus effect 중 어느 쪽이 나중에 실행될지 순서가 보장되지 않아,
 * cleanup 이 나중에 실행되면 방금 새 탭이 써 넣은 값을 다시 `null` 로 지워버리는 경합이
 * 있었습니다. 화면마다(탭이든 아니든) 자기 값을 쓰기만 하면 이 경합이 생기지 않습니다.
 */
export function useReportActiveTab(tab: NavTabId | null) {
  const setActiveTab = useTabStore((state) => state.setActiveTab);

  useFocusEffect(
    useCallback(() => {
      setActiveTab(tab);
    }, [tab, setActiveTab])
  );
}
