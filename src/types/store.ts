/**
 * 매장 도메인 타입.
 *
 * 직원이 프로필을 등록할 때 근무 매장을 UUID 로 보내야 해서, 그 UUID 를 찾기 위한
 * 검색 결과가 여기 담깁니다. 고객 쪽은 아직 매장을 고르지 않습니다 — 방문한 매장은
 * `/login` 에 고정값으로 적혀 있습니다.
 */

/** `GET /api/stores` 가 돌려주는 매장 한 곳. */
export interface StoreSummary {
  storeId: string;
  name: string;
  /** `MCM-SEOUL` 처럼 매장을 가리키는 짧은 코드. 이름과 함께 검색됩니다. */
  code: string;
  /** ISO 3166-1 alpha-2 국가 코드. */
  countryCode: string;
}
