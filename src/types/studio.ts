/** Studio `MCM Myself` 줄에 놓이는 장식용 프레임 식별자. 실제 촬영 프레임은 {@link StudioFrame} 참고. */
export type StudioFrameId = 'frame-01' | 'frame-02' | 'frame-03' | 'frame-04';

/** `/customers/studio/frames` 가 내려주는 촬영용 프레임 하나. */
export interface StudioFrame {
  /** 서버가 관리하는 프레임 종류. 새 프레임이 늘어날 수 있어 고정 유니온으로 두지 않습니다. */
  frameType: string;
  displayName: string;
  /** 카메라 위에 얹고, 촬영 시 Canvas 합성에도 그대로 쓰는 투명 PNG 주소. */
  overlayImageUrl: string;
}

export interface StudioFrameListResponse {
  success: boolean;
  data: StudioFrame[];
}

/** 셔터로 찍어 프레임과 합성한 결과. */
export interface StudioCapture {
  blob: Blob;
  /** 미리보기·저장에 쓰는 objectURL. 화면을 벗어나면 반드시 `URL.revokeObjectURL` 로 해제합니다. */
  previewUrl: string;
}
