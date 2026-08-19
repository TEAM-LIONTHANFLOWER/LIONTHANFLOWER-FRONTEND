import { useQuery } from '@tanstack/react-query';

import { api } from '@services/api';
import type { StudioFrameListResponse } from '@/types/studio';

export const studioKeys = {
  all: ['studio'] as const,
  frames: () => [...studioKeys.all, 'frames'] as const,
};

/** MCM Studio 에서 고를 수 있는 프레임 목록. 투명 PNG 오버레이 주소를 함께 내려줍니다. */
export function useStudioFrames() {
  return useQuery({
    queryKey: studioKeys.frames(),
    queryFn: () => api.get<StudioFrameListResponse>('/api/customers/studio/frames'),
    select: (response) => response.data,
  });
}
