/**
 * 직원이 응대를 마치고 방문 하나를 기록하는 단계 폼의 타입.
 *
 * 화면은 두 벌이지만 껍데기(머리말·단계 탭·NEXT)가 같아서, 단계와 입력 묶음을
 * 데이터로 적어 두고 한 화면이 그려 냅니다. 실제 값은 `@constants/record-form` 에 있습니다.
 */

/**
 * 방문 하나를 기록하는 두 흐름. 고객이 구매했는지로 갈립니다.
 *
 * - `arc` — 구매한 경우. Arc 를 작성합니다.
 * - `memory` — 구매하지 않은 경우. Visit Memory 를 작성합니다.
 */
export type RecordFlow = 'arc' | 'memory';

/**
 * 선택 묶음의 보기 하나.
 *
 * `value` 는 **서버 enum 값** 입니다(`CLASSIC_TIMELESS` 처럼). 화면에 보이는 것은 `label`
 * 이고, 스토어에 담겨 그대로 요청 바디로 나가는 것은 `value` 입니다. 라벨을 코드로 옮기는
 * 대응표를 따로 두지 않으려고 보기 자체에 코드를 적어 둡니다.
 */
export interface RecordOption {
  value: string;
  label: string;
  /**
   * 라벨 왼쪽에 놓는 색 동그라미. 색 자체가 보기인 선호 컬러 묶음만 들고 있습니다.
   * 한 가지 색이면 문자열, 그러데이션이면 색을 흐르는 순서대로 담은 배열입니다.
   */
  swatch?: string | readonly [string, string, ...string[]];
}

interface RecordSectionBase {
  /** 값을 담아 둘 열쇠. 흐름 안에서 겹치지 않아야 합니다. */
  id: string;
  label: string;
}

/** 한 줄 입력. 오른쪽에 붙는 장식 아이콘만 종류마다 다릅니다. */
export interface RecordTextSection extends RecordSectionBase {
  kind: 'text';
  placeholder: string;
  required?: boolean;
  icon?: 'calendar' | 'search';
}

/**
 * 달력에서 하루를 골라 넣는 칸.
 *
 * 서버가 `YYYY-MM-DD` 만 받아서 타이핑을 받지 않습니다 — 손으로 적게 두면 `200601` 처럼
 * 보낼 수 없는 값이 그대로 남습니다.
 */
export interface RecordDateSection extends RecordSectionBase {
  kind: 'date';
  placeholder: string;
  required?: boolean;
}

/**
 * `GET /api/stores` 에서 매장을 찾아 하나 고르는 칸.
 * 고르면 짝이 되는 국가 칸(`countryFieldId`)도 그 매장의 국가로 함께 채웁니다.
 */
export interface RecordStoreSection extends RecordSectionBase {
  kind: 'store';
  placeholder: string;
  required?: boolean;
  /** 매장을 고를 때 국가 코드를 함께 채울 묶음의 `id`. */
  countryFieldId?: string;
}

/**
 * 매장 목록에 실제로 있는 국가 중 하나를 고르는 칸.
 * 서버에 국가 목록 API 가 없어 매장의 `countryCode` 를 모아 씁니다.
 */
export interface RecordCountrySection extends RecordSectionBase {
  kind: 'country';
  placeholder: string;
  required?: boolean;
}

/** 여러 줄을 받는 메모. 라벨 아래에 안내 한 줄이 더 붙습니다. */
export interface RecordNoteSection extends RecordSectionBase {
  kind: 'note';
  placeholder: string;
  description: string;
  maxLength: number;
}

/**
 * `기타` 를 고른 뒤 그 아래 열리는 자유 입력.
 *
 * 서버가 `preferredColorOther` 처럼 묶음마다 짝이 되는 필드를 따로 받습니다.
 * 적은 값은 묶음 `id` 뒤에 `-other` 를 붙인 열쇠로 담깁니다.
 */
interface RecordOtherInput {
  /** `기타` 에 해당하는 보기의 값. 이 값이 골라져 있을 때만 입력칸이 열립니다. */
  otherValue?: string;
  otherPlaceholder?: string;
}

/** 알약 모양 칩으로 고르는 묶음. */
export interface RecordChipsSection extends RecordSectionBase, RecordOtherInput {
  kind: 'chips';
  options: readonly RecordOption[];
  /** 여러 개를 고를 수 있습니다. 비우면 하나만 고릅니다. */
  multiple?: boolean;
}

/**
 * 화면 폭을 꽉 채우는 줄 목록으로 고르는 묶음.
 *
 * 시안(2-1-3)이 이 모양을 늘 하나만 고르는 자리로 씁니다 — 응대 방식이나 구매 결정 방식처럼
 * 서로 배타적인 보기라서입니다. 여러 개를 고를 항목은 칩(`chips`) 으로 그립니다.
 */
export interface RecordOptionsSection extends RecordSectionBase, RecordOtherInput {
  kind: 'options';
  options: readonly RecordOption[];
}

/** 제품을 검색해 여러 개 담는 묶음. `+` 로 줄을 늘립니다. */
export interface RecordProductsSection extends RecordSectionBase {
  kind: 'products';
  placeholder: string;
  required?: boolean;
  /** 라벨 뒤에 `01`, `02` 처럼 번호를 붙입니다. */
  numbered?: boolean;
  /** 제품마다 함께 고르는 고객 반응. 없으면 제품 이름만 받습니다. */
  reactions?: readonly RecordOption[];
}

/** 입력 묶음 하나. 단계 안에 적힌 순서대로 놓입니다. */
export type RecordSection =
  | RecordTextSection
  | RecordDateSection
  | RecordStoreSection
  | RecordCountrySection
  | RecordNoteSection
  | RecordChipsSection
  | RecordOptionsSection
  | RecordProductsSection;

/** 폼의 한 단계. 위쪽 단계 탭 한 칸에 대응합니다. */
export interface RecordStep {
  id: string;
  /** 단계 탭에 적히는 이름 */
  label: string;
  sections: readonly RecordSection[];
}

/** 담아 둔 제품 한 줄. */
export interface RecordProduct {
  id: string;
  name: string;
  /**
   * 고른 제품의 서버 식별자(`productVariantId`).
   *
   * 목록에서 골라야 채워집니다. 직원이 글자만 치고 고르지 않은 줄은 비어 있고,
   * 서버가 가리킬 대상이 없어 요청에서 빠집니다.
   */
  variantId?: string;
  /** 고른 제품에 딸린 옵션 줄(`Option : BLACK · M`). 고르기 전에는 비어 있습니다. */
  options: readonly string[];
  /** 이 제품에 대한 고객 반응 */
  reactions: readonly string[];
}

/** 목록에서 제품 한 줄을 골랐을 때 함께 정해지는 값. */
export interface RecordProductSelection {
  name: string;
  variantId: string;
  options: readonly string[];
}

/** 작성 중인 값 한 벌. 흐름마다 따로 들고 있습니다. */
export interface RecordFormValues {
  /** 한 줄 입력과 메모. 묶음 `id` 로 찾습니다. */
  texts: Readonly<Record<string, string>>;
  /** 고른 보기. 하나만 고르는 묶음도 배열 한 칸으로 담아 한 가지 모양으로 다룹니다. */
  choices: Readonly<Record<string, readonly string[]>>;
  /** 담아 둔 제품 목록 */
  products: Readonly<Record<string, readonly RecordProduct[]>>;
}
