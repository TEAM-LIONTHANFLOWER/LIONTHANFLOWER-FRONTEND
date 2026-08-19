import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@services/api';
import type { StaffProfile, StaffProfileRegistration } from '@/types/staff';

export const staffKeys = {
  all: ['staff'] as const,
  profile: () => [...staffKeys.all, 'profile'] as const,
};

/**
 * 로그인한 직원의 프로필.
 *
 * 인증은 `staffToken` 쿠키가 들고 있어서 이 훅에 넘길 값이 없습니다.
 * 쿠키가 없으면 401 이 나고, 4xx 는 재시도하지 않으므로 곧바로 실패로 끝납니다.
 */
export function useStaffProfile() {
  return useQuery({
    queryKey: staffKeys.profile(),
    queryFn: () => api.get<StaffProfile>('/api/staff/me/profile'),
  });
}

/**
 * 직원 로그인 — 근무 매장과 구사 언어를 등록하고 인증 쿠키를 받습니다.
 *
 * 서버는 이 둘을 나눠 두었습니다.
 * 1. `POST /api/staff/me/profile` — 프로필을 만들고 `staffToken` 쿠키를 심습니다.
 *    응답 본문은 비어 있어서, 이것만으로는 방금 만든 직원이 누구인지 알 수 없습니다.
 * 2. `GET /api/staff/me/profile` — 방금 심은 쿠키로 `staffId` 를 포함한 프로필을 읽어 옵니다.
 *
 * 화면에서는 `Start to Journey` 한 번에 일어나는 일이라 훅 하나로 묶었습니다.
 */
export function useRegisterStaffProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registration: StaffProfileRegistration): Promise<StaffProfile> => {
      await api.post<void>('/api/staff/me/profile', { body: registration });
      return api.get<StaffProfile>('/api/staff/me/profile');
    },
    onSuccess: (profile) => {
      // 방금 읽어 온 값이라 다시 요청할 필요가 없습니다. 캐시에 그대로 심어 둡니다.
      queryClient.setQueryData(staffKeys.profile(), profile);
    },
  });
}
