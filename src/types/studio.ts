/** Studio 프레임 선택 캐러셀에 놓이는 프레임 식별자. */
export type StudioFrameId = 'frame-01' | 'frame-02' | 'frame-03' | 'frame-04';

/**
 * AI 매거진 생성 흐름의 단계.
 * `idle` — 프레임 미리보기, 셔터로 촬영 대기. `generating` — 셔터를 눌러 생성 중.
 * `complete` — 생성이 끝나 결과 이미지로 바뀐 상태.
 */
export type StudioGenerationStatus = 'idle' | 'generating' | 'complete';
