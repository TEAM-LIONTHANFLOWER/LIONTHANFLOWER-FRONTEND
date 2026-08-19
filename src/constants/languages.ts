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
 * 서버 enum 에 `KO` 가 추가되어 다섯 언어가 하나씩 그대로 짝을 이룹니다.
 * 예전에는 한국어를 고른 고객을 `EN` 으로 보내 직원에게 응대 언어를 잘못 알렸습니다.
 */
export const SERVICE_LANGUAGE_BY_LOCALE: Record<LocaleCode, ServiceLanguage> = {
  ko: 'KO',
  en: 'EN',
  zh: 'ZH',
  ja: 'JA',
  ru: 'RU',
};

/**
 * 서버 응대 언어 → 화면에 찍는 이름.
 *
 * 직원 홈의 카드가 고객의 응대 언어를 그대로 한 줄로 보여줍니다.
 * `SERVICE_LANGUAGE_BY_LOCALE` 의 정확한 반대 방향이라 되돌려도 값이 뭉개지지 않습니다.
 */
export const LANGUAGE_LABEL_BY_SERVICE_LANGUAGE: Record<ServiceLanguage, string> = {
  KO: '한국어',
  EN: 'English',
  ZH: '中文',
  JA: '日本語',
  RU: 'Русский',
};

/**
 * 직원이 고른 표시 언어들 → 서버가 받는 응대 언어 목록.
 *
 * 옮기는 규칙이 일대일이라 값이 겹칠 일은 없지만, 서버가 `uniqueItems` 를 요구하므로
 * 마지막에 한 번 걸러 보냅니다.
 */
export function toServiceLanguages(locales: readonly LocaleCode[]): ServiceLanguage[] {
  return [...new Set(locales.map((locale) => SERVICE_LANGUAGE_BY_LOCALE[locale]))];
}
