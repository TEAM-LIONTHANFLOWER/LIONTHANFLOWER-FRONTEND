/**
 * 앱 전역 설정값.
 * Expo 는 `EXPO_PUBLIC_` 접두사가 붙은 환경 변수만 클라이언트 번들에 주입합니다.
 * 값은 빌드 시점에 인라인되므로 비밀키는 절대 넣지 않습니다.
 */

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/** API 요청 기본 타임아웃 (ms) */
export const API_TIMEOUT_MS = 10_000;
