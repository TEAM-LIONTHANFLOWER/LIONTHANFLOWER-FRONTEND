/**
 * 네이티브(iOS/Android)에서 쓰는 프레임 오버레이 로컬 자산.
 *
 * `public/` 디렉터리는 웹 정적 배포(`dist/`)에만 복사되고 네이티브 번들에는 들어가지 않습니다.
 * 그래서 네이티브는 서버가 내려주는 상대경로(`overlayImageUrl`) 대신, 여기 미리 묶어 둔
 * 로컬 파일을 `frameType` 으로 찾아서 씁니다.
 *
 * 키는 백엔드가 관리하는 {@link StudioFrame.frameType} 과 정확히 같아야 합니다.
 * `overlayImageUrl` 문자열을 키로 쓰지 않는 이유는, 캐시버스팅 쿼리나 CDN 경로가 바뀌면
 * 그 값이 함께 바뀌어 매핑이 조용히 깨질 수 있기 때문입니다. `frameType` 은 그런 변경과
 * 무관한 안정적인 식별자입니다.
 */
import type { ImageRequireSource } from 'react-native';
import { Platform } from 'react-native';

import frame1 from '@assets/images/studio/Frame_1.svg';
import frame2 from '@assets/images/studio/Frame_2.svg';
import frame3 from '@assets/images/studio/Frame_3.svg';
import frame4 from '@assets/images/studio/Frame_4.svg';
import type { StudioFrame } from '@/types/studio';

export const STUDIO_FRAME_ASSETS: Record<string, ImageRequireSource> = {
  FRAME_1: frame1,
  FRAME_2: frame2,
  FRAME_3: frame3,
  FRAME_4: frame4,
};

/**
 * 프레임 오버레이 이미지 소스를 플랫폼에 맞게 골라줍니다.
 *
 * 웹은 서버가 내려준 상대경로를 그대로 씁니다 — 브라우저가 현재 도메인 기준으로 풀어줍니다.
 * 네이티브는 `frameType` 으로 로컬 자산을 찾고, 앱이 아직 모르는 새 프레임이면 `null` 을
 * 돌려줍니다. 호출부는 `null` 일 때 placeholder 를 보여줘야 합니다.
 */
export function resolveStudioFrameSource(frame: StudioFrame): ImageRequireSource | string | null {
  if (Platform.OS === 'web') {
    return frame.overlayImageUrl;
  }

  return STUDIO_FRAME_ASSETS[frame.frameType] ?? null;
}
