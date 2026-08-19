import { create } from 'zustand';

import type { StaffProfile } from '@/types/staff';

interface StaffState {
  /**
   * 로그인한 직원. 인증 자체는 `staffToken` 쿠키가 들고 있고, 여기에는 화면이 바로 읽어야
   * 하는 신원만 둡니다. 영구 저장소를 아직 도입하지 않아 앱을 껐다 켜면 비어 있습니다.
   */
  profile: StaffProfile | null;
  /** 로그인이 끝났을 때 호출합니다. */
  signIn: (profile: StaffProfile) => void;
  /** 로그아웃. 쿠키는 서버가 지우므로 여기서는 신원만 비웁니다. */
  signOut: () => void;
}

/** 직원 세션. 고객 방문(`visit-store`) 과 섞이지 않도록 따로 둡니다. */
export const useStaffStore = create<StaffState>((set) => ({
  profile: null,

  signIn: (profile) => set({ profile }),
  signOut: () => set({ profile: null }),
}));

/** 파생값은 상태로 저장하지 않고 셀렉터로 계산합니다. */
export const useStaffId = () => useStaffStore((state) => state.profile?.staffId ?? null);
export const useIsStaffSignedIn = () => useStaffStore((state) => state.profile !== null);
