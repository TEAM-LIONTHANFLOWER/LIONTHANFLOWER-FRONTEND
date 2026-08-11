import { create } from 'zustand';

import { setAuthToken } from '@services/api';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  /** 로그인 성공 시 호출합니다. API 클라이언트에도 토큰을 함께 등록합니다. */
  signIn: (user: User, token: string) => void;
  /** 로그아웃. 토큰을 지우고 API 클라이언트에서도 해제합니다. */
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  signIn: (user, token) => {
    setAuthToken(token);
    set({ user, token });
  },

  signOut: () => {
    setAuthToken(null);
    set({ user: null, token: null });
  },
}));

/**
 * 파생값은 상태로 저장하지 않고 셀렉터로 계산합니다.
 * 셀렉터를 쓰면 해당 값이 바뀔 때만 리렌더링됩니다.
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.token !== null);
export const useCurrentUser = () => useAuthStore((state) => state.user);
