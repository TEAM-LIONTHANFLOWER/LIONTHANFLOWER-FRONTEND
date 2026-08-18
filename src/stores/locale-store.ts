import { create } from 'zustand';

import { DEFAULT_LOCALE } from '@constants/languages';
import type { LocaleCode } from '@/types/i18n';

interface LocaleState {
  /**
   * 고객 화면을 그리는 언어.
   * 영구 저장소를 아직 도입하지 않아 앱을 껐다 켜면 기본 언어로 돌아갑니다.
   */
  locale: LocaleCode;
  /** 고객이 Language 칩을 누를 때마다 불립니다. 화면이 곧바로 그 언어로 바뀝니다. */
  setLocale: (locale: LocaleCode) => void;
  /** 다음 고객을 받기 전에 기본 언어로 되돌립니다. */
  reset: () => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: DEFAULT_LOCALE,

  setLocale: (locale) => set({ locale }),
  reset: () => set({ locale: DEFAULT_LOCALE }),
}));

/** 파생값은 상태로 저장하지 않고 셀렉터로 계산합니다. */
export const useLocale = () => useLocaleStore((state) => state.locale);
