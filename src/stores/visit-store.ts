import { create } from 'zustand';

import type { CustomerVisitSession, VisitStatus } from '@/types/visit';

interface VisitState {
  /**
   * 지금 진행 중인 방문. 로그인(진입 + 온보딩)을 마치면 채워집니다.
   * 영구 저장소를 아직 도입하지 않아 앱을 껐다 켜면 비어 있습니다.
   */
  session: CustomerVisitSession | null;
  /** 로그인이 끝났을 때 호출합니다. */
  startVisit: (session: CustomerVisitSession) => void;
  /** 직원 배정·Arc 생성처럼 서버에서 방문 상태만 달라졌을 때 호출합니다. */
  setStatus: (status: VisitStatus) => void;
  /** 방문이 끝났거나 다음 고객을 받기 전에 비웁니다. */
  endVisit: () => void;
}

/**
 * 고객 자신의 방문 세션.
 *
 * 서버에서 받아 온 목록·상세는 React Query 가 들고 있고, 여기에는 `내가 누구의
 * 어떤 방문인지` 만 둡니다. 로그인 세션과 같은 성격이라 화면이 바뀌어도 살아 있어야 하고,
 * 로그인 이후 화면들이 이 `visitId` 로 자기 방문을 가리킵니다.
 */
export const useVisitStore = create<VisitState>((set) => ({
  session: null,

  startVisit: (session) => set({ session }),
  setStatus: (status) =>
    set((state) => (state.session === null ? state : { session: { ...state.session, status } })),
  endVisit: () => set({ session: null }),
}));

/** 파생값은 상태로 저장하지 않고 셀렉터로 계산합니다. */
export const useVisitId = () => useVisitStore((state) => state.session?.visitId ?? null);
export const useHasActiveVisit = () => useVisitStore((state) => state.session !== null);
