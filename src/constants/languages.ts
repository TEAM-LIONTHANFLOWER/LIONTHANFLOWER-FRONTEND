/**
 * 앱이 지원하는 언어 목록.
 *
 * 고객 화면에서는 표시 언어를 하나 고르고, 직원 화면에서는 응대 가능한 언어를
 * 여러 개 고릅니다. 고르는 방식만 다를 뿐 목록은 같아 한곳에서 관리합니다.
 */

import type { LanguageOption, LocaleCode } from '@/types/i18n';
import type { ServiceLanguage } from '@/types/visit';

/** 순서가 Language 칩에 그려지는 순서입니다. */
export const SUPPORTED_LANGUAGES: readonly LanguageOption[] = [
  { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
] as const;

/** 아무것도 고르지 않았을 때의 표시 언어. */
export const DEFAULT_LOCALE: LocaleCode = 'ko';

/**
 * 표시 언어 → 서버가 받는 응대 언어(`serviceLanguage`).
 *
 * 서버 enum 에는 한국어가 없습니다 (`EN` `ZH` `JA` `RU`). 한국어를 고른 고객은 보낼 값이
 * 마땅치 않아 국제 기본값인 `EN` 으로 보냅니다. 서버에 `KO` 가 추가되면 이 줄만 고치면 됩니다.
 */
export const SERVICE_LANGUAGE_BY_LOCALE: Record<LocaleCode, ServiceLanguage> = {
  ko: 'EN',
  en: 'EN',
  zh: 'ZH',
  ja: 'JA',
  ru: 'RU',
};

/**
 * 서버 응대 언어 → 화면에 찍는 이름.
 *
 * 직원 홈의 카드가 고객의 응대 언어를 그대로 한 줄로 보여줍니다.
 * `SERVICE_LANGUAGE_BY_LOCALE` 의 반대 방향인데, 한국어가 `EN` 으로 합쳐지므로
 * 되돌릴 때는 영어로만 돌아옵니다.
 */
export const LANGUAGE_LABEL_BY_SERVICE_LANGUAGE: Record<ServiceLanguage, string> = {
  EN: 'English',
  ZH: '中文',
  JA: '日本語',
  RU: 'Русский',
};

/**
 * 직원이 고른 표시 언어들 → 서버가 받는 응대 언어 목록.
 *
 * 서버가 중복을 허용하지 않는데(`uniqueItems`) 한국어와 영어가 모두 `EN` 으로 가므로,
 * 둘 다 고른 직원은 값이 겹칩니다. 그래서 옮긴 뒤 중복을 걷어냅니다.
 */
export function toServiceLanguages(locales: readonly LocaleCode[]): ServiceLanguage[] {
  return [...new Set(locales.map((locale) => SERVICE_LANGUAGE_BY_LOCALE[locale]))];
}
