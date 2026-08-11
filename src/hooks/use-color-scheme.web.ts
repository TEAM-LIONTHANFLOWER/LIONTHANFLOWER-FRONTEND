import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/** 색상 스킴은 구독할 외부 스토어가 없으므로 빈 구독 함수를 넘깁니다. */
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * 정적 렌더링(웹)을 지원하려면 이 값을 클라이언트에서 다시 계산해야 합니다.
 * 하이드레이션 전에는 서버 렌더 결과와 맞추기 위해 'light' 를 반환합니다.
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const colorScheme = useRNColorScheme();

  return hasHydrated ? colorScheme : 'light';
}
