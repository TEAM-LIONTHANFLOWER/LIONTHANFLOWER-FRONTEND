/** 화면 사이를 오가는 탭 데이터. */

import navArc from '@assets/images/navigation/nav_arc.svg';
import navHome from '@assets/images/navigation/nav_home.svg';
import navStudio from '@assets/images/navigation/nav_studio.svg';
import type { NavTabOption } from '@/types/navigation';

/** 순서가 화면에 그려지는 순서입니다. */
export const NAV_TABS: readonly NavTabOption[] = [
  { id: 'home', label: 'Home', icon: navHome },
  { id: 'arc', label: 'Arc', icon: navArc },
  { id: 'studio', label: 'Studio', icon: navStudio },
] as const;
