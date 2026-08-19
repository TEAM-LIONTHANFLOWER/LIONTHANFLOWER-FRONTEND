import type { StudioCapture } from '@/types/studio';

/** 다운로드가 실제로 시작될 시간을 두고 objectURL 을 해제합니다. 즉시 해제하면 일부 브라우저에서 저장이 실패합니다. */
const DOWNLOAD_URL_REVOKE_DELAY_MS = 1000;

/** 합성된 사진을 브라우저 다운로드로 저장합니다. */
export function downloadStudioCapture(capture: StudioCapture) {
  // 미리보기용 previewUrl 과 생애주기를 분리하기 위해 저장 전용 objectURL 을 새로 만듭니다.
  const downloadUrl = URL.createObjectURL(capture.blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `mcm-studio-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), DOWNLOAD_URL_REVOKE_DELAY_MS);
}
