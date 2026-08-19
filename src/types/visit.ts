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
  /** 이 고객이 지금까지 쌓은 Arc 수. 상세 화면이 `기존 고객` 여부를 이걸로 가릅니다. */
  arcCount: number;
  /** 고객이 고른 응대 방식. 상세 화면의 `Initial setup` 팝업이 씁니다. */
  interactionStyle: InteractionStyle;
  /** 고객이 고른 응대 언어. 위와 같은 이유로 들고 있습니다. */
  serviceLanguage: ServiceLanguage;
  /** 고객이 남긴 추가 요구사항. 없으면 그 줄을 그리지 않습니다. */
  request?: string;
  mode: VisitMode;
  status: ServiceStatus;
  /** 응대를 시작한 시각(`HH:mm`). 담당 직원이 배정된 뒤에만 채워집니다. */
  startedAt?: string;
  /** 이 고객이 매장에 들어온 날(`YYYY.MM.DD`). 직원 홈이 날짜별로 묶는 기준입니다. */
  visitedOn: string;
  /** 이 방문에 딸린 Arc. 아직 쓰지 않았으면 비어 있습니다. */
  arcId?: string;
  /** 이 방문에 딸린 Visit Memory. 아직 쓰지 않았으면 비어 있습니다. */
  visitMemoryId?: string;
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

/** 직원 홈을 날짜별로 묶은 한 덩이. 최근 날짜가 위에 옵니다. */
export interface VisitDay {
  /** `YYYY.MM.DD` */
  date: string;
  visits: readonly StoreVisit[];
  /**
   * 그날 마무리된 Arc 기록.
   * 지난 Arc 를 내려주는 엔드포인트가 아직 없어 지금은 어디서도 채우지 않습니다.
   */
  arcs?: readonly ArcRecord[];
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
 * 앱이 보여주는 다섯 언어와 하나씩 짝이 맞습니다 — 옮기는 규칙은
 * `@constants/languages` 의 `SERVICE_LANGUAGE_BY_LOCALE` 에 있습니다.
 */
export type ServiceLanguage = 'KO' | 'EN' | 'ZH' | 'JA' | 'RU';

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
 * `GET /api/customers/visits/{visitId}/matching` 응답.
 *
 * 직원 추천을 고른 고객이 담당 직원 배정을 기다리며 되읽는 값입니다.
 * 아직 아무도 배정되지 않았으면 `staffId` `staffName` `matchedAt` 이 모두 비어 있습니다.
 */
export interface VisitMatching {
  visitId: string;
  status: VisitStatus;
  staffId?: string;
  staffName?: string;
  matchedAt?: string;
}

/**
 * 진입과 온보딩을 모두 마친 고객의 방문 세션.
 * 로그인 이후 화면들이 `visitId` 로 자기 방문을 가리킵니다.
 *
 * 아래 세 값은 고객이 `/login` 에서 직접 고른 것입니다. 서버에 보내기만 하고 되읽는
 * 엔드포인트가 없어 — 고객용 응답 중 이 셋을 주는 것이 하나도 없습니다 — 보낸 값을
 * 여기 그대로 들고 있습니다. `Initial setup` 팝업이 이걸 읽습니다.
 */
export interface CustomerVisitSession {
  visitId: string;
  customerName: string;
  status: VisitStatus;
  serviceLanguage: ServiceLanguage;
  interactionStyle: InteractionStyle;
  additionalRequest?: string;
}

/**
 * `GET /api/customers/visit-memories/{visitMemoryId}` 응답.
 *
 * 직원이 쓴 그날의 기록을 고객이 읽는 모양입니다. **본문은 `summary` 문자열 하나** 이고,
 * Arc 편지처럼 세 토막으로 나뉘어 오지 않습니다 — 시안의 `Visit Memory` 편지지는 소제목
 * 셋을 그리도록 되어 있어 여기가 어긋납니다. (`docs/api-integration.md` 의 정밀 대조 3 참고)
 */
export interface VisitMemoryDetail {
  visitMemoryId: string;
  visitId: string;
  storeName: string;
  countryCode: string;
  summary?: string;
  finalizedAt?: string;
}
