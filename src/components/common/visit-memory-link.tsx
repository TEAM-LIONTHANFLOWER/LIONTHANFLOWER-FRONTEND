import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ActionPill } from '@components/common/action-pill';
import { LetterSheet } from '@components/common/letter-sheet';
import { PopupOverlay } from '@components/common/popup-overlay';
import { FixedColors, FontFamily, FontWeight, LineHeightRatio } from '@constants/theme';
import type { LetterContent } from '@/types/arc';

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
   * - `text` — 글자만. 직원 기록 완료 화면이 씁니다.
   * - `pill` — 흰 테두리를 두른 알약. 고객 Arc 화면과 직원 고객 상세 화면이 씁니다.
   *   시안(2-1 arc 조회)이 카드 위에 놓이는 이 버튼만 테두리로 감싸,
   *   같은 줄의 뒤로 가기 화살표와 무게를 맞춰 둡니다.
   */
  variant?: 'text' | 'pill';
  /** 팝업에 얹을 편지. */
  letter?: LetterContent;
  /**
   * 편지가 없을 때 대신 그릴 것 — 기다리는 중이거나, 실패했거나, 받은 기록이 없을 때입니다.
   * 무엇을 보여줄지는 부르는 쪽이 정합니다. 고객 화면은 고객이 고른 언어로,
   * 직원 화면은 한국어로 적어야 해서 여기서 문구를 들고 있지 않습니다.
   */
  fallback?: ReactNode;
}

/**
 * 머리말 오른쪽 끝의 `Visit Memory`. 누르면 그날의 방문 기록이 팝업으로 열립니다.
 *
 * 아직 Arc 로 봉해지기 전의 기록이라, 봉투 없이 Arc 편지와 같은 편지지에만 얹습니다.
 * 고객 Arc 화면과 직원 화면이 같은 동작을 해서 버튼과 팝업을 함께 들고 있습니다.
 *
 * 편지를 어디서 가져오는지는 역할마다 달라 이 컴포넌트가 정하지 않습니다 — 고객은
 * 알림에서 얻은 식별자로 읽고(`@components/customer/customer-visit-memory-link`),
 * 직원은 방금 쓴 기록을 그대로 넘겨 줍니다.
 *
 * 어두운 브랜드 배경 위에만 올라가므로 글자색이 흰색으로 고정입니다.
 */
export function VisitMemoryLink({ variant = 'text', letter, fallback }: VisitMemoryLinkProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === 'pill' ? (
        <ActionPill
          label={LABEL}
          tone="outline"
          expanded={isOpen}
          onPress={() => setIsOpen(true)}
        />
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
        {letter === undefined ? (
          fallback
        ) : (
          <LetterSheet content={letter} variant="memory" style={styles.sheet} />
        )}
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
