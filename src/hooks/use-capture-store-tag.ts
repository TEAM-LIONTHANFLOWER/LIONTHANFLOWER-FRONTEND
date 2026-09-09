import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { useStoreTagStore } from '@stores/store-tag-store';

/**
 * 같은 이름의 쿼리가 두 번 이상 붙으면(`?store=A&store=B`) 배열로 들어옵니다.
 * 잘못 구운 태그라 첫 값만 쓰고, 값이 비어 있으면 태그가 없는 것으로 봅니다.
 */
function readCode(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const code = raw?.trim() ?? '';

  return code.length === 0 ? null : code;
}

/**
 * 매장 NFC 태그로 들어왔는지 확인해 매장 코드를 전역 상태에 넣습니다 — 진입 화면(`/`)이 씁니다.
 *
 * 태그에는 `https://mcm-orbit.site/?store=MCM-SEOUL` 처럼 매장 코드를 `store` 쿼리에 붙인 주소가
 * 적혀 있고, 그 주소가 사이트 첫 화면을 가리킵니다. 그래서 여기서 한 번만 읽습니다.
 * 굽는 방법은 `docs/nfc-tag.md` 를 참고하세요.
 *
 * 진입 화면은 스플래시 뒤에 곧바로 온보딩이나 로그인으로 `replace` 하고, 그때 URL 에서 쿼리가
 * 사라집니다. 그래서 화면을 떠나기 전에 값을 옮겨 둡니다.
 *
 * 태그 없이 들어온 진입이면 지난 코드를 지웁니다. 매장에 놓인 기기로 다음 고객이 주소만 쳐서
 * 들어왔을 때 앞 사람이 찍은 매장이 남아 있으면 안 됩니다.
 */
export function useCaptureStoreTag() {
  const { store } = useLocalSearchParams<{ store?: string | string[] }>();
  const setCode = useStoreTagStore((state) => state.setCode);

  useEffect(() => {
    setCode(readCode(store));
  }, [store, setCode]);
}
