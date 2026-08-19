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
  /** 담당 직원이 배정된 시각. 아직 아무도 응대하지 않으면 비어 있습니다. */
  matchedAt?: string;
  /** 고객이 매장에 들어온 시각. 직원 홈이 날짜별로 묶는 기준입니다. */
  visitedAt?: string;
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

/* ─────────────────────────────────────────────────────────────────────────────
 * Visit Memory
 *
 * 구매하지 않은 고객의 방문을 직원이 기록하면 서버가 글을 써서 고객에게 보냅니다.
 * 아래 enum 값은 `@constants/record-form` 의 보기 `value` 와 같은 것입니다 —
 * 폼의 보기 목록이 이 타입으로 검사되므로 둘이 어긋나면 컴파일이 막힙니다.
 * ────────────────────────────────────────────────────────────────────────── */

/** 제품 하나에 고객이 보인 반응. */
export type ProductEngagement =
  | 'VIEWED_WITH_INTEREST'
  | 'COMPARED'
  | 'TRIED_OR_INSPECTED'
  | 'ASKED_STAFF'
  | 'VIEWED_LONG'
  | 'CONSIDERED_PURCHASE';

/** 고객이 무엇을 눈여겨봤는지. */
export type InterestPoint =
  | 'DESIGN'
  | 'COLOR'
  | 'MATERIAL_QUALITY'
  | 'PRACTICALITY'
  | 'STORAGE_FUNCTIONALITY'
  | 'SIZE'
  | 'BRAND_IDENTITY'
  | 'PRICE'
  | 'RARITY_LIMITED'
  | 'GIFT_SUITABILITY'
  | 'TRAVEL_DAILY_USE'
  | 'OTHER';

/** 구매하지 않은 이유. 시안은 세 묶음으로 나눠 묻지만 서버는 한 배열로 받습니다. */
export type NoPurchaseReason =
  | 'CONSIDERING_PURCHASE'
  | 'NEED_COMPARE'
  | 'NEED_MORE_TIME'
  | 'CONSIDER_PRICE'
  | 'DESIRED_PRODUCT_OR_COLOR_NOT_FOUND'
  | 'TRAVEL_SCHEDULE'
  | 'INSUFFICIENT_TIME'
  | 'CONSULT_COMPANION'
  | 'CONSULT_GIFT_RECIPIENT'
  | 'BUDGET'
  | 'PLAN_REVISIT'
  | 'BROWSING_ONLY'
  | 'OTHER';

/**
 * 직원이 폼에 적은 값 한 벌.
 *
 * 앞의 세 필드는 **키가 반드시 있어야 합니다.** 스펙에는 필수 표시가 없지만 서버가 요구하고,
 * 빠지면 `COMMON-400` 에 `fieldErrors` 가 비어 옵니다. 값이 비어 있는 것(`{}` / `[]`)은 됩니다.
 * 자세한 것은 `docs/api-integration.md` 의 "막힌 것" 1 참고.
 */
export interface VisitMemoryInputSnapshot {
  /** `제품 식별자 → 그 제품에 보인 반응`. 제품 검색 API 가 없어 지금은 늘 비어 있습니다. */
  productEngagements: Readonly<Record<string, readonly ProductEngagement[]>>;
  interestPoints: readonly InterestPoint[];
  /** `OTHER` 를 골랐을 때 직원이 적은 말. */
  interestPointOther?: string;
  noPurchaseReasons: readonly NoPurchaseReason[];
  noPurchaseReasonOther?: string;
  nextVisitMemo?: string;
}

/** 생성이 어디까지 왔는지. */
export type GenerationStatus = 'GENERATING' | 'READY' | 'FAILED';

/** 서버가 쓴 글. */
export interface VisitMemoryGeneratedContent {
  summary?: string;
}

/**
 * `POST /api/staff/visits/{visitId}/visit-memories` 와
 * `GET /api/staff/visit-memories/{visitMemoryId}` 의 응답.
 */
export interface StaffVisitMemory {
  visitMemoryId: string;
  visitId: string;
  status: GenerationStatus;
  inputSnapshot?: VisitMemoryInputSnapshot;
  generatedContent?: VisitMemoryGeneratedContent;
  /** 생성이 실패했을 때만 채워집니다. */
  failureCode?: string;
  generatedAt?: string;
  /** 고객에게 보낸 시각. 보내기 전에는 비어 있습니다. */
  finalizedAt?: string;
}
