/**
 * 앱 전역 설정값.
 * Expo 는 `EXPO_PUBLIC_` 접두사가 붙은 환경 변수만 클라이언트 번들에 주입합니다.
 * 값은 빌드 시점에 인라인되므로 비밀키는 절대 넣지 않습니다.
 */

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/** API 요청 기본 타임아웃 (ms) */
export const API_TIMEOUT_MS = 10_000;

/**
 * 직원 로그인이 보낼 근무 매장 식별자(UUID).
 *
 * 서버는 `POST /api/staff/me/profile` 에서 `storeId` 를 UUID 로만 받는데, 매장을 검색하거나
 * 목록으로 받아 올 엔드포인트가 아직 없습니다. `/staff/login` 의 `Working At` 은 자유 입력이라
 * 화면에서 UUID 를 만들 방법이 없어, 임시로 환경 변수에서 읽습니다.
 * 매장 조회 API 가 생기면 이 값과 그것을 읽는 코드를 함께 지웁니다.
 */
export const DEFAULT_STORE_ID = process.env.EXPO_PUBLIC_DEFAULT_STORE_ID ?? '';
