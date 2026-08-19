import type { StudioCapture } from '@/types/studio';

/** 합성된 사진을 브라우저 다운로드로 저장합니다. */
export function downloadStudioCapture(capture: StudioCapture) {
  const link = document.createElement('a');
  link.href = capture.previewUrl;
  link.download = `mcm-studio-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
