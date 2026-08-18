import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { FixedColors, LineHeightRatio, Radius, Spacing, Typography } from '@constants/theme';
import { useLocale } from '@stores/locale-store';
import letterPaper from '@assets/images/arc/letter-paper.jpg';
import reimaginedForYou from '@assets/images/arc/reimagined-for-you.svg';
import type { LetterContent } from '@/types/arc';

/** 시안의 편지지 치수. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
export const LETTER_HEIGHT = 441;
const PADDING_LEFT = 34;
const PADDING_TOP = 40;
/** Arc 편지는 오른쪽에 장식 글씨가 흐르고 있어 본문을 그만큼 덜 씁니다. */
const PADDING_RIGHT_ARC = 73;
const PADDING_RIGHT_MEMORY = PADDING_LEFT;

const SECTION_GAP = Spacing.three;
/** 매장·날짜 줄. Figma 텍스트 스타일에 없는 크기라 여기서 직접 잡습니다. */
const META_FONT_SIZE = 11;
/** 글머리 기호와 글 사이. 시안의 목록 들여쓰기와 같은 값입니다. */
const BULLET_INDENT = 19.5;

/** Arc 편지 본문은 인쇄된 듯 살짝 눌러 그립니다. Visit Memory 팝업은 그대로 둡니다. */
const BODY_OPACITY = 0.8;

/** 오른쪽에 세로로 흐르는 `Reimagined for you` 장식. */
const SCRIPT_LENGTH = 444;
const SCRIPT_THICKNESS = 89.454;
/** 카드 위로 살짝 넘겨 세로를 꽉 채웁니다. 넘친 만큼은 카드가 잘라냅니다. */
const SCRIPT_TOP_OVERFLOW = 2;
/**
 * RN 의 회전축은 요소 한가운데입니다. 가로로 누운 그림을 90° 세워 카드 오른쪽 끝에
 * 붙이려면, 돌리기 전 자리를 길이와 두께의 차이만큼 미리 밀어 두어야 합니다.
 */
const SCRIPT_SHIFT = (SCRIPT_LENGTH - SCRIPT_THICKNESS) / 2;

interface LetterSheetProps {
  content: LetterContent;
  /**
   * - `arc` — 봉투에서 꺼낸 Arc 편지. 제목이 크고, 오른쪽에 장식 글씨가 흐릅니다.
   * - `memory` — `Visit Memory` 팝업. 장식 없이 글만 얹습니다.
   */
  variant?: 'arc' | 'memory';
  style?: StyleProp<ViewStyle>;
}

/**
 * 종이 질감 위에 글을 얹은 편지지 한 장.
 * 봉투에서 꺼낸 Arc 편지와 `Visit Memory` 팝업이 같은 편지지를 씁니다.
 *
 * 밝은 종이 위에만 올라가므로 글자색이 `FixedColors` 로 고정입니다.
 * 높이는 시안대로 고정이고, 넘치는 글은 잘라냅니다.
 */
export function LetterSheet({ content, variant = 'arc', style }: LetterSheetProps) {
  const isArc = variant === 'arc';
  const locale = useLocale();

  return (
    <View style={[styles.sheet, style]}>
      <Image
        source={letterPaper}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        accessible={false}
      />

      {isArc ? (
        <Image
          source={reimaginedForYou}
          style={styles.script}
          contentFit="contain"
          accessible={false}
        />
      ) : null}

      <View style={[styles.content, isArc ? styles.contentArc : styles.contentMemory]}>
        <View>
          <Text style={[isArc ? styles.titleArc : styles.titleMemory]}>{content.title}</Text>
          <Text style={styles.meta}>{content.place}</Text>
          <Text style={styles.meta}>{content.issuedOn}</Text>
        </View>

        <View style={[styles.sections, isArc && styles.sectionsFaded]}>
          {content.sections.map((section) => (
            <View key={section.id}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              {section.lines.map((line, index) =>
                section.bulleted ? (
                  // 줄 목록은 서버에서 오는 값이라 내용이 겹칠 수 있습니다.
                  // 순서가 바뀌지 않는 목록이라 자리를 키로 씁니다.
                  <View key={index} style={styles.bulletRow}>
                    <Text style={styles.line}>{'•'}</Text>
                    <Text style={[styles.line, styles.bulletLine]}>{line[locale]}</Text>
                  </View>
                ) : (
                  <Text key={index} style={styles.line}>
                    {line[locale]}
                  </Text>
                )
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    height: LETTER_HEIGHT,
    borderRadius: Radius.card,
    overflow: 'hidden',
    backgroundColor: FixedColors.cardSurface,
  },
  content: {
    flex: 1,
    paddingTop: PADDING_TOP,
    paddingLeft: PADDING_LEFT,
    gap: SECTION_GAP,
  },
  contentArc: {
    paddingRight: PADDING_RIGHT_ARC,
  },
  contentMemory: {
    paddingRight: PADDING_RIGHT_MEMORY,
  },
  titleArc: {
    ...Typography.titleEn24,
    color: FixedColors.cardAccent,
  },
  titleMemory: {
    ...Typography.titleEn20,
    color: FixedColors.cardAccent,
  },
  meta: {
    fontFamily: Typography.bodyKo13.fontFamily,
    fontSize: META_FONT_SIZE,
    lineHeight: META_FONT_SIZE * LineHeightRatio.base,
    fontWeight: Typography.bodyKo13.fontWeight,
    color: FixedColors.onLight,
  },
  sections: {
    gap: SECTION_GAP,
  },
  sectionsFaded: {
    opacity: BODY_OPACITY,
  },
  sectionTitle: {
    ...Typography.titleEn14,
    color: FixedColors.cardAccent,
  },
  line: {
    ...Typography.bodyKo13,
    color: FixedColors.onLight,
  },
  bulletRow: {
    flexDirection: 'row',
  },
  // 기호와 글 사이를 벌리고, 글이 넘칠 때 기호 아래로 파고들지 않게 남은 폭을 다 씁니다.
  bulletLine: {
    flex: 1,
    marginLeft: BULLET_INDENT,
  },
  script: {
    position: 'absolute',
    top: SCRIPT_SHIFT - SCRIPT_TOP_OVERFLOW,
    right: -SCRIPT_SHIFT,
    width: SCRIPT_LENGTH,
    height: SCRIPT_THICKNESS,
    transform: [{ rotate: '90deg' }],
  },
});
