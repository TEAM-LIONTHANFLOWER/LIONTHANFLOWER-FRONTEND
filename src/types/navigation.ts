/**
 * 하단 내비게이션 도메인 타입.
 * 실제 탭 데이터(라벨·아이콘)는 `@constants/navigation` 의 `NAV_TABS` 에 있습니다.
 */
import type { ImageRequireSource } from 'react-native';

/** 하단 내비게이션 탭 식별자 */
export type NavTabId = 'home' | 'arc' | 'studio';

/** 하단 내비게이션 탭 하나. */
export interface NavTabOption {
  id: NavTabId;
  label: string;
  icon: ImageRequireSource;
}
