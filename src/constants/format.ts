/**
 * 화면에 그대로 찍히는 문자열을 만드는 함수들.
 *
 * 서버는 숫자와 ISO 시각으로 내려주는데 시안은 `1st Arc`, `2026.08.12` 처럼 완성된
 * 문자열을 그립니다. 고객·직원 양쪽 화면이 같은 표기를 써서 한곳에 모았습니다.
 */

/** 영어 서수 접미사. 11·12·13 은 `th` 라 십의 자리를 먼저 봅니다. */
function ordinalSuffix(count: number): string {
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 13) {
    return 'th';
  }

  switch (count % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/** `1` → `1st`. Arc 번호를 시안의 서수 표기로 옮깁니다. */
export function toOrdinal(count: number): string {
  return `${count}${ordinalSuffix(count)}`;
}

/** ISO 시각 → `2026.08.12`. 값이 없거나 읽을 수 없으면 빈 문자열입니다. */
export function toDotDate(isoDate: string | undefined): string {
  if (isoDate === undefined) {
    return '';
  }

  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsed.getDate()}`.padStart(2, '0');

  return `${parsed.getFullYear()}.${month}.${day}`;
}

const MONTH_NAMES = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
] as const;

/**
 * ISO 시각 → `12 AUGUST 2026`.
 * 편지 발행일은 시안(2-3 Arc)이 봉투와 달리 영문으로 적습니다.
 */
export function toLetterDate(isoDate: string | undefined): string {
  if (isoDate === undefined) {
    return '';
  }

  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return `${parsed.getDate()} ${MONTH_NAMES[parsed.getMonth()]} ${parsed.getFullYear()}`;
}
