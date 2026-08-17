import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { BrandWordmark } from '@components/common/brand-wordmark';
import { FixedColors, Spacing, Typography } from '@constants/theme';

/**
 * 시안(393 폭)에서 워드마크가 안전 영역 위쪽 끝에서 떨어진 거리.
 * 매칭 화면이 로고를 이 자리로 옮기며 넘어오기 때문에 밖으로 냅니다.
 */
export const WORDMARK_TOP = 45;

/** 잘라 쓴 작은 워드마크는 시안(2-1 Arc)대로 위쪽 끝에 더 붙습니다. */
const COMPACT_WORDMARK_TOP = 21;

/** 워드마크 아래 타이틀까지의 간격. */
const WORDMARK_TO_TITLE = 12;
/** 작은 워드마크는 아래가 비어 보이지 않도록 타이틀까지 더 띄웁니다. */
const COMPACT_WORDMARK_TO_TITLE = 38;

/** 고객·직원 홈이 모두 같은 문구를 씁니다. 화면마다 다른 것은 아래 설명 한 줄뿐입니다. */
const TITLE = 'Ready for your next move?';

interface BrandIntroHeaderProps {
  /** 타이틀 아래 한 줄 안내. 화면마다 다릅니다. */
  description: string;
  /**
   * 워드마크 오른쪽 끝에 나란히 놓는 요소.
   * Arc 화면의 기본설정 버튼과 직원 상세 화면의 `Visit Memory` 가 여기 들어갑니다. 홈에는 없습니다.
   */
  accessory?: ReactNode;
  /**
   * 타이틀과 안내 줄의 가로 정렬. 워드마크 줄은 정렬과 상관없이 늘 양 끝에 붙습니다.
   *
   * - `start` — 왼쪽 맞춤. 목록이 이어지는 홈 계열 화면입니다.
   * - `center` — 가운데 맞춤. 카드 한 장이 화면 한가운데 놓이는 Arc 화면입니다.
   */
  align?: 'start' | 'center';
  /**
   * 워드마크를 글자만 남기고 잘라 쓰고 머리말 높이를 줄입니다.
   * 아래에 봉투 한 장을 통째로 세워야 하는 Arc 화면이 씁니다.
   */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * 홈 계열 화면 맨 위의 브랜드 머리말.
 * MCM 워드마크 + 공통 타이틀 + 화면별 안내 한 줄로 이루어집니다.
 *
 * 어두운 브랜드 배경(`BrandBackdrop`) 위에만 올라가므로 글자색이 흰색으로 고정입니다.
 */
export function BrandIntroHeader({
  description,
  accessory,
  align = 'start',
  compact = false,
  style,
}: BrandIntroHeaderProps) {
  const centered = align === 'center' && styles.centered;

  return (
    <View style={style}>
      {/* 곁들임은 워드마크 아래가 아니라 위쪽 끝에 맞춰 걸립니다. */}
      <View style={[styles.wordmarkRow, compact && styles.wordmarkRowCompact]}>
        <BrandWordmark compact={compact} />
        {accessory}
      </View>

      <Text style={[styles.title, compact && styles.titleCompact, centered]}>{TITLE}</Text>
      <Text style={[styles.description, centered]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: WORDMARK_TOP,
  },
  wordmarkRowCompact: {
    // 잘린 워드마크는 세로 가운데가 아니라 글자 줄에 맞춰야 곁들임과 눈높이가 맞습니다.
    alignItems: 'center',
    marginTop: COMPACT_WORDMARK_TOP,
  },
  title: {
    ...Typography.titleEn20,
    color: FixedColors.onDark,
    marginTop: WORDMARK_TO_TITLE,
  },
  titleCompact: {
    marginTop: COMPACT_WORDMARK_TO_TITLE,
  },
  description: {
    ...Typography.bodyKo13,
    color: FixedColors.onDark,
    marginTop: Spacing.two,
  },
  centered: {
    textAlign: 'center',
  },
});
