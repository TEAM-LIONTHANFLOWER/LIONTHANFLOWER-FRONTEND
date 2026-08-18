import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ActionPill } from '@components/common/action-pill';
import { LetterSheet } from '@components/common/letter-sheet';
import { PopupOverlay } from '@components/common/popup-overlay';
import { VISIT_MEMORY_LETTER } from '@constants/arc';
import { FixedColors, FontFamily, FontWeight, LineHeightRatio } from '@constants/theme';

/** 글자 높이가 20 이라 최소 터치 영역 44 를 채우려면 위아래로 12 씩 더 필요합니다. */
const HIT_SLOP = { top: 12, bottom: 12 } as const;
const LABEL_FONT_SIZE = 13;

/** 시안(2-1 Arc - Visit Memory)의 편지지 폭. Arc 편지보다 조금 좁습니다. */
const SHEET_WIDTH = 294;

const LABEL = 'Visit Memory';

interface VisitMemoryLinkProps {
  /**
   * 버튼의 모양.
   *
   * - `text` — 글자만. 직원 화면의 머리말과 완료 화면이 씁니다.
   * - `pill` — 흰 테두리를 두른 알약. 고객 Arc 화면이 씁니다. 시안(2-1 Arc)이
   *   봉투 위에 놓이는 이 버튼만 테두리로 감싸 톱니 아이콘과 눈높이를 맞춰 둡니다.
   */
  variant?: 'text' | 'pill';
}

/**
 * 머리말 오른쪽 끝의 `Visit Memory`. 누르면 그날의 방문 기록이 팝업으로 열립니다.
 *
 * 아직 Arc 로 봉해지기 전의 기록이라, 봉투 없이 Arc 편지와 같은 편지지에만 얹습니다.
 * 고객 Arc 화면과 직원 고객 상세 화면이 같은 동작을 해서 버튼과 팝업을 함께 들고 있습니다.
 *
 * 어두운 브랜드 배경 위에만 올라가므로 글자색이 흰색으로 고정입니다.
 */
export function VisitMemoryLink({ variant = 'text' }: VisitMemoryLinkProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === 'pill' ? (
        <ActionPill label={LABEL} tone="outline" onPress={() => setIsOpen(true)} />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={LABEL}
          accessibilityState={{ expanded: isOpen }}
          hitSlop={HIT_SLOP}
          onPress={() => setIsOpen(true)}
        >
          <Text style={styles.label}>{LABEL}</Text>
        </Pressable>
      )}

      <PopupOverlay visible={isOpen} onClose={() => setIsOpen(false)} label={LABEL}>
        <LetterSheet content={VISIT_MEMORY_LETTER} variant="memory" style={styles.sheet} />
      </PopupOverlay>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: FontFamily.sansBold,
    fontSize: LABEL_FONT_SIZE,
    lineHeight: LABEL_FONT_SIZE * LineHeightRatio.base,
    fontWeight: FontWeight.bold,
    color: FixedColors.onDark,
  },
  // 좁은 화면에서도 고정 폭이 넘치지 않도록 최대 폭을 함께 둡니다.
  sheet: {
    width: SHEET_WIDTH,
    maxWidth: '100%',
  },
});
