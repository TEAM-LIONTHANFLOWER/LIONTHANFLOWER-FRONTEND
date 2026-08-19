/**
 * 직원 API 도메인 타입.
 *
 * 직원 인증은 `staffToken` 쿠키로 이루어집니다 — 프로필을 등록하면 서버가 쿠키를 심고,
 * 그 뒤 직원용 요청은 쿠키만으로 통과합니다. 화면이 토큰을 들고 다니지 않습니다.
 */

import type { ArcStatus, ProductColor, ProductOption } from '@/types/arc';
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
  /** 이 방문에 딸린 Arc. 아직 쓰지 않았으면 비어 있습니다. */
  arcId?: string;
  /** 이 방문에 딸린 Visit Memory. 아직 쓰지 않았으면 비어 있습니다. */
  visitMemoryId?: string;
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

/* ─────────────────────────────────────────────────────────────────────────────
 * 제품
 *
 * Arc 는 고객이 산 제품을 `productVariantId` 로 가리킵니다. 그 UUID 를 얻는 곳이
 * `GET /api/staff/products` 입니다 — 검색 파라미터가 없어 목록 전체가 한 번에 옵니다.
 * ────────────────────────────────────────────────────────────────────────── */

export type ProductCategory = 'BAG' | 'CLOTHING' | 'ACCESSORY';

/**
 * 제품 하나에 딸린 색·사이즈 조합.
 *
 * 서버가 가리키는 단위는 제품이 아니라 이 조합입니다. 폼에서 고르는 것도 이 단위라,
 * `구매 제품` 한 줄이 곧 variant 하나입니다.
 *
 * 색과 사이즈는 `@/types/arc` 의 것과 같은 enum 입니다 — 고객 편지에 적히는 값과
 * 직원이 고르는 값이 같아야 해서 한 벌만 두고 함께 씁니다. **선호 컬러(`PreferredColor`)
 * 와는 다른 목록입니다.** 제품에 실제로 있는 색과, 고객이 좋아한다고 말한 색은 다릅니다.
 */
export interface StaffProductVariant {
  productVariantId: string;
  externalVariantCode?: string;
  color?: ProductColor;
  option?: ProductOption;
}

/** `GET /api/staff/products` 가 돌려주는 제품 한 건. */
export interface StaffProduct {
  productId: string;
  externalProductCode?: string;
  name: string;
  category?: ProductCategory;
  variants?: readonly StaffProductVariant[];
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Arc
 *
 * 구매한 고객의 방문을 직원이 기록하면 서버가 편지를 써서 고객에게 보냅니다.
 * Visit Memory 와 달리 글이 리비전으로 쌓입니다 — `다시 생성하기` 를 누를 때마다
 * 같은 Arc 에 새 리비전이 얹히고, 그중 하나를 골라 고객에게 보냅니다.
 *
 * 아래 enum 값은 `@constants/record-form` 의 보기 `value` 와 같은 것입니다.
 * ────────────────────────────────────────────────────────────────────────── */

/** 이번 방문에서 눈여겨본 제품군. */
export type PreferredCategory = ProductCategory;

/**
 * 이번 방문에서의 선호 컬러.
 * 제품에 붙는 `ProductColor` 와 이름이 겹치는 값이 있지만 **다른 목록입니다** —
 * 이쪽에만 `BROWN_BEIGE` `NAVY_BLUE` `METALLIC` `OTHER` 가 있습니다.
 */
export type PreferredColor =
  | 'BLACK'
  | 'WHITE'
  | 'BROWN_BEIGE'
  | 'GRAY'
  | 'NAVY_BLUE'
  | 'RED'
  | 'PINK'
  | 'GREEN'
  | 'YELLOW'
  | 'METALLIC'
  | 'MULTI_COLOR'
  | 'OTHER';

/** 이번 방문에서의 선호 스타일. */
export type PreferredStyle =
  | 'CLASSIC_TIMELESS'
  | 'MINIMAL_SIMPLE'
  | 'LOGO_FORWARD'
  | 'PATTERN_GRAPHIC'
  | 'DISTINCTIVE'
  | 'CASUAL'
  | 'FORMAL_REFINED'
  | 'TRENDY'
  | 'PRACTICAL'
  | 'OTHER';

/** 무엇을 보고 사기로 했는지. */
export type PurchaseCriterion =
  | 'DESIGN'
  | 'PRACTICALITY'
  | 'BRAND_IDENTITY'
  | 'RARITY'
  | 'PRICE'
  | 'QUALITY_MATERIAL'
  | 'STORAGE_FUNCTIONALITY'
  | 'SIZE'
  | 'COLOR'
  | 'GIFT_SUITABILITY'
  | 'TRAVEL_DAILY_USE'
  | 'OTHER';

/** 실제로 어떤 응대를 좋아했는지. */
export type InteractionPreference =
  'ACTIVE_RECOMMENDATION' | 'MODERATE_GUIDANCE' | 'FREE_EXPLORATION' | 'CONTEXT_DEPENDENT';

/** 제품 설명을 어느 정도로 듣고 싶어 했는지. */
export type ExplanationPreference = 'DETAILED' | 'KEY_POINTS_ONLY' | 'ON_DEMAND';

/** 구매를 어떻게 결정하는 편인지. */
export type PurchaseDecisionStyle = 'QUICK' | 'COMPARE_FIRST' | 'DELIBERATE' | 'CONTEXT_DEPENDENT';

/**
 * 직원이 Arc 폼에 적은 값 한 벌.
 *
 * **선택으로 적힌 다섯을 뺀 나머지는 키가 반드시 있어야 합니다.** 스펙에는 필수 표시가
 * 없지만 서버가 요구하고, 빠지면 `COMMON-400` 에 `fieldErrors` 가 비어 옵니다.
 * `purchaseCountry` `purchaseStore` 는 빈 문자열도 안 되고,
 * `purchasedProductVariantIds` 는 빈 배열도 안 됩니다 — 나머지 배열은 `[]` 이면 됩니다.
 * 자세한 것은 `docs/api-integration.md` 의 "막힌 것" 1 참고.
 */
export interface ArcInputSnapshot {
  /** `YYYY-MM-DD`. 점으로 적어 보내면 400 입니다. */
  purchaseDate: string;
  purchaseCountry: string;
  purchaseStore: string;
  /** 산 제품. 실재하는 variant 여야 합니다 — 없는 UUID 를 넣으면 500 이 옵니다. */
  purchasedProductVariantIds: readonly string[];
  preferredCategories: readonly PreferredCategory[];
  preferredColors: readonly PreferredColor[];
  /** `OTHER` 를 골랐을 때 직원이 적은 말. */
  preferredColorOther?: string;
  preferredStyles: readonly PreferredStyle[];
  preferredStyleOther?: string;
  /** 사지는 않았지만 눈여겨본 제품. */
  interestedProductVariantIds: readonly string[];
  purchaseCriteria: readonly PurchaseCriterion[];
  purchaseCriterionOther?: string;
  interactionPreferences: readonly InteractionPreference[];
  explanationPreferences: readonly ExplanationPreference[];
  purchaseDecisionStyle?: PurchaseDecisionStyle;
  staffObservation?: string;
}

/** 서버가 쓴 편지. 고객 화면의 세 단락과 같은 모양입니다. */
export interface ArcGeneratedContent {
  momentSummary?: string;
  preferences?: readonly string[];
  momentToRemember?: string;
}

/**
 * Arc 생성·재생성·전송·미리보기가 모두 돌려주는 리비전 한 건.
 *
 * `arcStatus` 는 Arc 전체가 어디까지 갔는지(`DRAFT` → 고객에게 보내면 `SHARED` →
 * 고객이 저장하면 `FINALIZED`), `revisionStatus` 는 이 리비전의 글이 다 써졌는지입니다.
 * 전송은 `READY` 인 리비전만 됩니다.
 */
export interface StaffArcRevision {
  arcId: string;
  revisionId: string;
  revisionNumber?: number;
  arcStatus: ArcStatus;
  revisionStatus: GenerationStatus;
  inputSnapshot?: ArcInputSnapshot;
  generatedContent?: ArcGeneratedContent;
  /** 생성이 실패했을 때만 채워집니다. */
  failureCode?: string;
  /** 고객에게 보낸 시각. 보내기 전에는 비어 있습니다. */
  sharedAt?: string;
}
