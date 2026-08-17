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
