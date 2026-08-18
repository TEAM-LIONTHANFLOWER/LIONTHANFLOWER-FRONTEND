/**
 * 앱이 지원하는 언어 목록.
 *
 * 고객 화면에서는 표시 언어를 하나 고르고, 직원 화면에서는 응대 가능한 언어를
 * 여러 개 고릅니다. 고르는 방식만 다를 뿐 목록은 같아 한곳에서 관리합니다.
 */

import type { LanguageOption, LocaleCode } from '@/types/i18n';

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
