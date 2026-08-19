/**
 * 직원이 고객을 어떻게 만나고 있는지. 직원 홈 위쪽 탭이 이 값으로 목록을 가릅니다.
 *
 * - `with` — 직원이 곁에서 응대하는 고객
 * - `solo` — 혼자 둘러보겠다고 한 고객
 */
export type VisitMode = 'with' | 'solo';

/** 응대가 어디까지 진행됐는지. */
export type ServiceStatus = 'waiting' | 'in-progress' | 'done';

/** 매장에 들어온 고객 한 명. 직원 홈의 카드 한 장에 대응합니다. */
export interface StoreVisit {
  id: string;
  name: string;
  /** 접객 가능한 언어. 시안은 가운뎃점으로 이어 붙여 한 줄로 보여줍니다. */
  languages: readonly string[];
  /** `1st Arc` 처럼 서수까지 포함한 표시용 문자열 */
  arcLabel: string;
  /** 고객이 남긴 추가 요구사항. 없으면 그 줄을 그리지 않습니다. */
  request?: string;
  mode: VisitMode;
  status: ServiceStatus;
  /** 응대를 시작한 시각(`HH:mm`). `in-progress` 일 때만 채웁니다. */
  startedAt?: string;
}

/** 이미 마무리돼 기록으로 남은 Arc 한 건. */
export interface ArcRecord {
  id: string;
  /** `Ethan’s 1st Arc` 처럼 완성된 제목 */
  title: string;
  store: string;
  /** `YYYY.MM.DD` */
  date: string;
}

/** 직원 홈을 날짜별로 묶은 한 덩이. 오늘 들어온 고객이 먼저, 지난 기록이 뒤에 옵니다. */
export interface VisitDay {
  /** `YYYY.MM.DD` */
  date: string;
  visits: readonly StoreVisit[];
  arcs: readonly ArcRecord[];
}

/** Visit Memory 카드 뷰어가 좌우로 넘겨 보여주는 면. */
export type MemoryPage = 'arc' | 'memory';

/** 카드 한 면의 내용. 제목 한 줄과 본문 여러 줄로 단순합니다. */
export interface MemoryCardContent {
  page: MemoryPage;
  title: string;
  lines: readonly string[];
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 서버 API 도메인
 *
 * 위쪽은 화면이 그리는 모양이고, 아래는 `/api/customers/visits` 계열이 주고받는 값입니다.
 * enum 값은 서버가 쓰는 이름을 그대로 둡니다 — 화면 쪽 표기와 섞이지 않게 하기 위해서입니다.
 * ────────────────────────────────────────────────────────────────────────── */

/** 방문 한 건이 어디까지 진행됐는지. */
export type VisitStatus =
  | 'ONBOARDING'
  | 'WAITING_FOR_STAFF'
  | 'ACTIVE'
  | 'ARC_IN_PROGRESS'
  | 'VISIT_MEMORY_IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELED';

/**
 * 직원이 고객을 응대할 언어.
 * 서버 목록에 한국어가 없습니다 — 표시 언어에서 이 값으로 옮기는 규칙은
 * `@constants/languages` 의 `SERVICE_LANGUAGE_BY_LOCALE` 에 있습니다.
 */
export type ServiceLanguage = 'EN' | 'ZH' | 'JA' | 'RU';

/** 고객이 고른 접객 방식. 화면 쪽 `ServiceStyleCode` 에 대응합니다. */
export type InteractionStyle = 'STAFF_RECOMMENDATION' | 'SELF_GUIDED';

/** `POST /api/customers/visits` 응답. 쿠키로 고객을 식별하고 새 방문을 엽니다. */
export interface VisitEntry {
  visitId: string;
  /** 다시 찾아온 고객이면 지난 방문에서 받은 이름이 담겨 옵니다. 처음이면 비어 있습니다. */
  customerName?: string;
  status: VisitStatus;
}

/** `PATCH /api/customers/visits/{visitId}/onboarding` 요청 바디. */
export interface OnboardingSubmission {
  name: string;
  serviceLanguage: ServiceLanguage;
  interactionStyle: InteractionStyle;
  additionalRequest?: string;
}

/** 위 요청의 응답. */
export interface VisitOnboardingResult {
  visitId: string;
  status: VisitStatus;
}

/**
 * 진입과 온보딩을 모두 마친 고객의 방문 세션.
 * 로그인 이후 화면들이 `visitId` 로 자기 방문을 가리킵니다.
 */
export interface CustomerVisitSession {
  visitId: string;
  customerName: string;
  status: VisitStatus;
}
