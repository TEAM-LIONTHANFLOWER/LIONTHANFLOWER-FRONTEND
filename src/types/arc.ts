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
  /** `Your MCM Moment` 처럼 영문 소제목 */
  title: string;
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
  /** 매장과 도시 한 줄 — `MCM HAUS · SEOUL(REPUBLIC OF KOREA)` */
  place: string;
  /** 편지 머리의 날짜. 봉투와 달리 영문으로 적습니다 — `13 AUGUST 2026` */
  issuedOn: string;
  sections: readonly LetterSection[];
}

/** Arc 한 건. 봉투 겉면 정보와 그 안에 든 편지를 함께 들고 있습니다. */
export interface ArcEntry {
  id: string;
  /** 봉투 겉면 제목. `Your 1st Arc` 처럼 서수까지 포함합니다. */
  envelopeTitle: string;
  store: string;
  /** 봉투에 적히는 날짜 `YYYY.MM.DD` */
  date: string;
  letter: LetterContent;
}

/** 기본 설정 팝업의 한 줄. 영문 항목명과 그 아래 값으로 이루어집니다. */
export interface InitialSetupItem {
  id: string;
  /** `Service`, `Language` 처럼 영문 항목명 */
  label: string;
  /** 고객이 고른 언어로 보여 줍니다. */
  value: LocalizedText;
  /**
   * 값에 쓸 타이포 토큰.
   * 시안이 줄마다 13 / 14 로 다르게 지정해서 데이터로 들고 있습니다.
   */
  valueToken: Extract<TypographyToken, 'bodyKo13' | 'bodyKo14'>;
}
