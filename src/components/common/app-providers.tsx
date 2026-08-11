import { QueryClientProvider, focusManager } from '@tanstack/react-query';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';

import { createQueryClient } from '@services/query-client';

/**
 * 앱이 포그라운드로 돌아오면 stale 상태인 쿼리를 다시 불러옵니다.
 * 웹은 React Query 가 window focus 이벤트로 이미 처리하므로 네이티브에서만 등록합니다.
 */
function useAppStateFocus() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });

    return () => subscription.remove();
  }, []);
}

/** 앱 전역 Provider 를 한곳에 모읍니다. 새 Provider 는 여기에 추가합니다. */
export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);

  useAppStateFocus();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
