import type { ImageRequireSource } from 'react-native';

/**
 * 앱에 들어온 경로.
 * 스플래시와 온보딩은 고객·직원이 함께 쓰기 때문에, 온보딩이 끝난 뒤
 * 어느 로그인 화면으로 보낼지 결정하려면 진입 경로를 알고 있어야 합니다.
 */
export type EntryRole = 'customer' | 'staff';

/** 온보딩 슬라이드 한 장. */
export interface OnboardingSlide {
  /** 슬라이드 식별자 */
  id: string;
  /** 화면을 가득 채우는 배경 사진 */
  background: ImageRequireSource;
  /** 두 줄로 나뉘는 큰 타이틀. 줄바꿈 위치가 시안에 정해져 있어 배열로 둡니다. */
  title: readonly string[];
  /** 타이틀 아래 설명. 마찬가지로 줄바꿈 위치를 시안과 맞춥니다. */
  description: readonly string[];
  /** 시안에서 자간이 따로 지정된 슬라이드만 씁니다. */
  titleLetterSpacing?: number;
}

/** 접객에 쓰는 언어. 온보딩 마지막 정보 입력 화면의 Language 칩 선택지입니다. */
export type ServiceLanguageCode = 'ko' | 'en' | 'zh' | 'ja' | 'fr' | 'de';

export interface ServiceLanguageOption {
  code: ServiceLanguageCode;
  /** 영문 이름. 직원 화면에서 씁니다. */
  label: string;
  /** 해당 언어로 쓴 이름. 고객 화면에서 씁니다. */
  nativeLabel: string;
}

/** 고객이 원하는 접객 방식. 정보 입력 화면의 Service Style 선택지입니다. */
export type ServiceStyleCode = 'recommendation' | 'self-guided';

export interface ServiceStyleOption {
  code: ServiceStyleCode;
  label: string;
}
