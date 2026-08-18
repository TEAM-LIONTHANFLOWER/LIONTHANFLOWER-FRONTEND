import { useCallback } from 'react';

import { MESSAGES } from '@constants/messages';
import { useLocaleStore } from '@stores/locale-store';
import type { LocaleCode, MessageKey, MessageParams } from '@/types/i18n';

/** 문구 안 `{store}` 처럼 중괄호로 감싼 자리를 `params` 값으로 바꿉니다. */
function format(template: string, params?: MessageParams): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = params[name];

    // 넘겨받지 못한 자리는 지우지 않고 그대로 둡니다. 빈칸이 생기는 것보다
    // `{store}` 가 그대로 보이는 편이 빠진 값을 찾기 쉽습니다.
    return value === undefined ? placeholder : String(value);
  });
}

/** 키로 문구를 꺼내는 함수. */
export type Translator = (key: MessageKey, params?: MessageParams) => string;

/**
 * 고객이 고른 언어로 문구를 꺼내 옵니다.
 *
 * ```tsx
 * const { t } = useTranslation();
 * <Text>{t('login.storeNotice', { store: 'MCM HAUS' })}</Text>;
 * ```
 *
 * 언어가 바뀌면 이 훅을 쓰는 화면만 다시 그려집니다.
 */
export function useTranslation(): { t: Translator; locale: LocaleCode } {
  const locale = useLocaleStore((state) => state.locale);

  const t = useCallback<Translator>(
    (key, params) => format(MESSAGES[locale][key], params),
    [locale]
  );

  return { t, locale };
}
