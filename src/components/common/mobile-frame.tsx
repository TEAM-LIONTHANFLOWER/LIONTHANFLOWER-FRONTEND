import type { PropsWithChildren } from 'react';

/**
 * 네이티브에서는 화면이 이미 모바일 크기라 아무것도 하지 않고 그대로 통과시킵니다.
 * 실제 프레임을 그리는 웹 전용 구현은 `mobile-frame.web.tsx` 에 있습니다.
 */
export function MobileFrame({ children }: PropsWithChildren) {
  return <>{children}</>;
}
