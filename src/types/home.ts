import type { ImageRequireSource } from 'react-native';

import type { TypographyToken } from '@constants/theme';

/** 고객 홈 위쪽에서 화면 내용을 가르는 탭. */
export type CustomerSectionKey = 'home' | 'arc';

/** 지금 진행 중인 브랜드 경험을 소개하는 큰 사진 카드. */
export interface NowOnFeature {
  id: string;
  /** 카드 왼쪽 위 흰 알약에 들어가는 짧은 라벨 */
  badge: string;
  title: string;
  description: string;
  image: ImageRequireSource;
}

/** `About MCM` 처럼 제목 한 줄과 본문 한 덩이로 이루어진 브랜드 소개 글. */
export interface BrandStory {
  id: string;
  title: string;
  body: string;
  /**
   * 본문에 쓸 타이포 토큰.
   * 시안이 글마다 13 / 14 로 다르게 지정해서 데이터로 들고 있습니다.
   */
  bodyToken: Extract<TypographyToken, 'bodyKo13' | 'bodyKo14'>;
  /** 이 줄 수를 넘으면 말줄임표로 접습니다. 없으면 전문을 그대로 보여줍니다. */
  maxLines?: number;
}
