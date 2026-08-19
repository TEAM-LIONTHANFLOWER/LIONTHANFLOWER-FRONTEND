/**
 * 다국어 도메인 타입.
 *
 * 고객 화면의 표시 언어와 직원의 응대 가능 언어가 같은 목록을 씁니다.
 * 실제 언어 데이터는 `@constants/languages`, 문구 사전은 `@constants/messages` 에 있습니다.
 */

/** 앱이 지원하는 언어. 순서는 시안(213-164) 의 Language 칩과 같습니다. */
export type LocaleCode = 'ko' | 'en' | 'zh' | 'ja' | 'ru';

/** Language 칩 하나. */
export interface LanguageOption {
  code: LocaleCode;
  /** 영문 이름. 직원 화면에서 씁니다. */
  label: string;
  /** 해당 언어로 쓴 이름. 고객 화면에서 씁니다. */
  nativeLabel: string;
}

/**
 * 한 덩이의 글을 언어별로 담은 값.
 *
 * 화면을 이루는 문구는 `MESSAGES` 사전에서 꺼내지만, 브랜드 소개글처럼 나중에
 * 콘텐츠 API 로 옮겨 갈 글은 데이터 쪽에 언어별로 담아 둡니다. 서버가 내려줄
 * 모양과 같아서, API 가 붙으면 자리만 바꾸면 됩니다.
 */
export type LocalizedText = Record<LocaleCode, string>;

/**
 * 번역 문구 키.
 *
 * `점(.)` 앞은 문구가 쓰이는 화면입니다. 여기에 키를 추가하면 다섯 언어 사전이
 * 모두 채워질 때까지 타입 검사가 통과하지 않습니다 — 번역 누락을 막는 장치입니다.
 */
export type MessageKey =
  | 'login.storeNotice'
  | 'login.namePlaceholder'
  | 'login.requestPlaceholder'
  | 'login.startFailed'
  | 'serviceStyle.recommendation'
  | 'serviceStyle.selfGuided'
  | 'matching.waiting'
  | 'matching.failed'
  | 'matching.retry'
  | 'home.description'
  | 'home.sectionTabsLabel'
  | 'arc.description'
  | 'arc.empty'
  | 'arc.loadFailed'
  | 'arc.retry'
  | 'studio.description'
  | 'studio.previewDescription'
  | 'studio.generating'
  | 'studio.complete'
  | 'a11y.startJourney'
  | 'a11y.openEnvelope'
  | 'a11y.backToEnvelopes'
  | 'a11y.closePopup'
  | 'a11y.goBack'
  | 'a11y.pageIndicator'
  | 'a11y.pageNumber'
  | 'a11y.frame'
  | 'a11y.generatedMagazine'
  | 'a11y.delete'
  | 'a11y.save'
  | 'a11y.next';

/** 한 언어의 문구 묶음. */
export type Messages = Record<MessageKey, string>;

/** 문구 안 `{store}` 처럼 중괄호로 감싼 자리에 넣을 값. */
export type MessageParams = Record<string, string | number>;
