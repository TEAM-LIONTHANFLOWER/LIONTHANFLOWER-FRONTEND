import { useEffect, useState } from 'react';

/**
 * 값이 잠잠해질 때까지 기다렸다가 넘겨줍니다.
 *
 * 입력할 때마다 요청이 나가는 것을 막는 용도입니다. 글자를 칠 때마다 이 훅이 든 값은
 * 그대로 있다가, `delayMs` 동안 더 이상 바뀌지 않으면 그때 최신 값으로 한 번 바뀝니다.
 *
 * ```tsx
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebouncedValue(query, 300);
 * const { data } = useStoreSearch(debouncedQuery); // 타이핑이 멈춘 뒤에만 요청
 * ```
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);

    // 값이 또 바뀌면 예약해 둔 갱신을 버리고 처음부터 다시 셉니다.
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
