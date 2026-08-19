/**
 * Arc 도메인 타입.
 *
 * Arc 는 방문 한 번이 남기는 기록입니다. 목록에서는 봉투 겉면으로 보이고,
 * 봉투를 열면 안에 든 편지가 나옵니다.
 *
 * 실제 데이터는 아직 API 가 없어 `@constants/arc` 에 고정값으로 있습니다.
 */
import type { TypographyToken } from '@constants/theme';
import type { LocalizedText } from '@/types/i18n';

/** 편지 본문의 한 단락. 제목 한 줄과 여러 줄 본문으로 이루어집니다. */
export interface LetterSection {
  id: string;
  /**
   * `Your MCM Moment` 처럼 영문 소제목.
   * 서버가 본문을 토막 내지 않고 한 덩이로 보내는 `Visit Memory` 는 이 줄이 없습니다.
   */
  title?: string;
  /** 본문을 글머리 기호 목록으로 그릴지. 생략하면 줄만 바꾼 문단입니다. */
  bulleted?: boolean;
  /** 고객이 고른 언어로 보여 줍니다. */
  lines: readonly LocalizedText[];
}

/**
 * 편지지 한 장에 적히는 글.
 * Arc 편지와 Visit Memory 팝업이 같은 모양을 써서 타입을 함께 씁니다.
 */
export interface LetterContent {
  /** `Ethan’s 2nd Arc` 처럼 완성된 제목 */
  title: string;
  /**
   * 매장과 도시 한 줄 — `MCM HAUS · SEOUL(REPUBLIC OF KOREA)`.
   * 아직 고객에게 보내지 않은 Visit Memory 처럼 적을 것이 없으면 비웁니다.
   */
  place?: string;
  /** 편지 머리의 날짜. 봉투와 달리 영문으로 적습니다 — `13 AUGUST 2026` */
  issuedOn?: string;
  sections: readonly LetterSection[];
}

/**
 * 봉투 겉면에 적히는 것만 모은 최소 단위.
 *
 * 목록 응답(`GET /api/customers/arcs`)만으로 만들 수 있는 범위입니다. 편지 본문은
 * 상세 응답에만 있어서, 봉투를 그리는 동안에는 아직 편지가 없을 수 있습니다.
 */
export interface ArcEnvelopeInfo {
  id: string;
  /** 봉투 겉면 제목. `Your 1st Arc` 처럼 서수까지 포함합니다. */
  envelopeTitle: string;
  store: string;
  /** 봉투에 적히는 날짜 `YYYY.MM.DD` */
  date: string;
}

/** Arc 한 건. 봉투 겉면 정보와 그 안에 든 편지를 함께 들고 있습니다. */
export interface ArcEntry extends ArcEnvelopeInfo {
  letter: LetterContent;
}

/** 기본 설정 팝업의 한 줄. 영문 항목명과 그 아래 값으로 이루어집니다. */
export interface InitialSetupItem {
  id: string;
  /** `Service`, `Language` 처럼 영문 항목명 */
  label: string;
  /**
   * 이미 언어가 정해진 글.
   * 고객 화면은 고객이 고른 언어로, 직원 화면은 한국어로 골라 넣습니다.
   */
  value: string;
  /**
   * 값에 쓸 타이포 토큰.
   * 시안이 줄마다 13 / 14 로 다르게 지정해서 데이터로 들고 있습니다.
   */
  valueToken: Extract<TypographyToken, 'bodyKo13' | 'bodyKo14'>;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 서버 API 도메인
 *
 * 위쪽은 화면이 그리는 모양이고, 아래는 `/api/customers/arcs` 가 주고받는 값입니다.
 * enum 값은 서버가 쓰는 이름을 그대로 둡니다.
 * ────────────────────────────────────────────────────────────────────────── */

/** Arc 한 건이 어디까지 왔는지. 직원이 쓰면 `DRAFT`, 고객에게 보내면 `SHARED`, 고객이 저장하면 `FINALIZED`. */
export type ArcStatus = 'DRAFT' | 'SHARED' | 'FINALIZED';

export type ProductColor =
  | 'BLACK'
  | 'WHITE'
  | 'BEIGE'
  | 'BROWN'
  | 'GRAY'
  | 'RED'
  | 'PINK'
  | 'ORANGE'
  | 'YELLOW'
  | 'GREEN'
  | 'BLUE'
  | 'PURPLE'
  | 'MULTI_COLOR';

export type ProductOption = 'XS' | 'S' | 'M' | 'L' | 'ONE_SIZE';

/** 고객이 살펴봤거나 구매한 제품 한 건. */
export interface ArcProduct {
  productVariantId: string;
  productName: string;
  color?: ProductColor;
  option?: ProductOption;
}

/**
 * `GET /api/customers/arcs` 의 한 건.
 *
 * 봉투 겉면에 필요한 값은 이제 목록에 다 있습니다(`storeName`). 다만 편지 본문은
 * 아직 여기 다 오지 않아 — 고객 이름·국가·`preferences`·구매 제품은 상세에만 있습니다 —
 * 봉투를 열었을 때 그릴 글을 얻으려면 상세를 한 번 더 불러야 합니다.
 */
export interface ArcListItem {
  arcId: string;
  arcNumber: number;
  /** 봉투 겉면에 적히는 매장 이름. */
  storeName?: string;
  momentSummary?: string;
  momentToRemember?: string;
  representativeProduct?: ArcProduct;
  status: ArcStatus;
  sharedAt?: string;
  finalizedAt?: string;
}

/** `GET /api/customers/arcs/{arcId}` 응답. 편지에 들어갈 글이 모두 여기 있습니다. */
export interface ArcDetail {
  arcId: string;
  arcNumber: number;
  customerName: string;
  storeName: string;
  countryCode: string;
  status: ArcStatus;
  sharedAt?: string;
  finalizedAt?: string;
  momentSummary?: string;
  preferences?: readonly string[];
  momentToRemember?: string;
  purchasedProducts?: readonly ArcProduct[];
}

/** `POST /api/customers/arcs/{arcId}/finalize` 응답. */
export interface ArcFinalization {
  arcId: string;
  status: ArcStatus;
  finalizedAt: string;
}
