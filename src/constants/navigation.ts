/** 화면 사이를 오가는 탭 데이터. */

import type { PillTabOption } from '@components/common/pill-tabs';
import navArc from '@assets/images/navigation/nav_arc.svg';
import navHome from '@assets/images/navigation/nav_home.svg';
import navStudio from '@assets/images/navigation/nav_studio.svg';
import type { CustomerSectionKey } from '@/types/home';
import type { NavTabOption } from '@/types/navigation';

/** 순서가 화면에 그려지는 순서입니다. */
export const NAV_TABS: readonly NavTabOption[] = [
  { id: 'home', label: 'Home', icon: navHome },
  { id: 'arc', label: 'Arc', icon: navArc },
  { id: 'studio', label: 'Studio', icon: navStudio },
] as const;

/**
 * 머리말 아래 알약 탭. 고객 홈과 Arc 화면이 서로를 오갑니다.
 * 하단 내비게이션의 `Home` / `Arc` 와 같은 곳으로 갑니다.
 */
export const CUSTOMER_SECTION_TABS: readonly PillTabOption<CustomerSectionKey>[] = [
  { value: 'home', label: 'Home' },
  { value: 'arc', label: 'Arc' },
] as const;
