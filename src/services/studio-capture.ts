import type { StudioCapture } from '@/types/studio';

/**
 * 네이티브에는 아직 촬영 결과를 저장하는 방법이 없습니다 — MCM Studio 촬영은 웹 전용입니다.
 * 실제 다운로드는 `studio-capture.web.ts` 참고.
 */
export function downloadStudioCapture(_capture: StudioCapture) {}
