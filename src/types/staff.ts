/**
 * 직원 API 도메인 타입.
 *
 * 직원 인증은 `staffToken` 쿠키로 이루어집니다 — 프로필을 등록하면 서버가 쿠키를 심고,
 * 그 뒤 직원용 요청은 쿠키만으로 통과합니다. 화면이 토큰을 들고 다니지 않습니다.
 */

import type { InteractionStyle, ServiceLanguage, VisitStatus } from '@/types/visit';

/** `POST /api/staff/me/profile` 요청 바디. */
export interface StaffProfileRegistration {
  /** 근무 매장. 서버는 UUID 만 받습니다 — `@constants/config` 의 `DEFAULT_STORE_ID` 참고. */
  storeId: string;
  name: string;
  /** 응대 가능한 언어. 최소 한 개이고 중복이 없어야 합니다. */
  languages: readonly ServiceLanguage[];
}

/** `GET /api/staff/me/profile` 응답. */
export interface StaffProfile {
  staffId: string;
  storeId: string;
  name: string;
  languages: readonly ServiceLanguage[];
  createdAt: string;
}

/** `GET /api/staff/visits` 가 돌려주는 방문 한 건. */
export interface StaffVisitSummary {
  visitId: string;
  customerName: string;
  status: VisitStatus;
  serviceLanguage: ServiceLanguage;
  interactionStyle: InteractionStyle;
  /** 이미 배정된 직원. 아직 아무도 응대하지 않으면 비어 있습니다. */
  staffId?: string;
  additionalRequest?: string;
  /** 이 고객이 지금까지 쌓은 Arc 수. */
  arcCount: number;
}

/** `GET /api/staff/visits` 응답. */
export interface StaffVisitList {
  visits: readonly StaffVisitSummary[];
}

/** `POST /api/staff/visits/{visitId}/assignment` 응답. */
export interface StaffVisitAssignment {
  visitId: string;
  staffId: string;
  status: VisitStatus;
  matchedAt: string;
}
