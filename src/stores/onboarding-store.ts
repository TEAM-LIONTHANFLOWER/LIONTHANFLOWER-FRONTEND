import { create } from 'zustand';

interface OnboardingState {
  /**
   * 온보딩을 끝까지 봤는지 여부.
   * 영구 저장소를 아직 도입하지 않아 앱을 껐다 켜면 다시 false 가 됩니다.
   */
  hasCompleted: boolean;
  /** 온보딩을 완료 처리합니다. 다음 진입부터는 스플래시 뒤 바로 로그인으로 갑니다. */
  complete: () => void;
  /** 온보딩을 처음부터 다시 보게 만듭니다. */
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasCompleted: false,

  complete: () => set({ hasCompleted: true }),
  reset: () => set({ hasCompleted: false }),
}));

/** 파생값은 상태로 저장하지 않고 셀렉터로 계산합니다. */
export const useHasCompletedOnboarding = () => useOnboardingStore((state) => state.hasCompleted);
