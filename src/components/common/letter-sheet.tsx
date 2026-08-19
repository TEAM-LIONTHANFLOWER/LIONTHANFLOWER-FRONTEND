import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { FixedColors, LineHeightRatio, Radius, Spacing, Typography } from '@constants/theme';
import { useLocale } from '@stores/locale-store';
import letterPaper from '@assets/images/arc/letter-paper.jpg';
import reimaginedForYou from '@assets/images/arc/reimagined-for-you.svg';
import type { LetterContent } from '@/types/arc';

/** 시안의 편지지 치수. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
export const LETTER_HEIGHT = 441;

/** 글이 놓이는 자리. 왼쪽 여백은 두 편지가 같고 오른쪽만 다릅니다. */
const PADDING_LEFT = 34;
/** Arc 편지는 오른쪽에 장식 글씨가 흐르고 있어 본문을 그만큼 덜 씁니다. */
const PADDING_RIGHT_ARC = 73;
const PADDING_RIGHT_MEMORY = PADDING_LEFT;
/** `Visit Memory` 팝업은 글을 위에서부터 차례로 흘립니다. */
const PADDING_TOP_MEMORY = 40;

/**
 * Arc 편지(시안 2-3)의 자리값.
 * 편지지 높이가 고정이라 시안처럼 요소마다 자리를 직접 잡습니다.
 */
const TITLE_TOP = 25;
/** 제목은 장식 글씨를 뺀 폭 안에서 가운데로 옵니다. */
const TITLE_RIGHT = 58;
/** 제목 크기. Figma 텍스트 스타일에 없는 크기라 여기서 직접 잡습니다. */
const TITLE_FONT_SIZE = 26;

/** 제목 아래에 두 줄로 긋는 밑줄. */
const RULE_TOP = 68;
const RULE_GAP = 4;
const RULE_LEFT = 30;
const RULE_RIGHT = 33.5;
/** 시안은 0.75 라 실기기에서 가장 얇게 그려지는 굵기를 씁니다. */
const RULE_WIDTH = StyleSheet.hairlineWidth;

/** 밑줄 아래 본문이 시작하는 높이. */
const BODY_TOP_ARC = 89;

/** 편지지 맨 아래에 남기는 발행 정보. */
const FOOTER_TOP = 391;
const FOOTER_RIGHT = 85;
/** 발행 정보 크기. Figma 텍스트 스타일에 없는 크기라 여기서 직접 잡습니다. */
const FOOTER_FONT_SIZE = 9;

const SECTION_GAP_ARC = 20;
const SECTION_GAP_MEMORY = Spacing.three;
/** Arc 편지의 소제목. Figma 텍스트 스타일에 없는 크기라 여기서 직접 잡습니다. */
const SECTION_TITLE_FONT_SIZE_ARC = 13;

/** `Visit Memory` 팝업의 매장·날짜 줄. Figma 텍스트 스타일에 없는 크기라 여기서 직접 잡습니다. */
const META_FONT_SIZE = 11;

/** 글머리 기호와 글 사이. 시안의 목록 들여쓰기와 같은 값입니다. */
const BULLET_INDENT = 19.5;

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
   * - `arc` — 봉투에서 꺼낸 Arc 편지. 제목이 크게 가운데에 놓이고 아래에 밑줄이 두 줄 그어지며,
   *   매장·날짜는 편지지 맨 아래로 내려갑니다. 오른쪽에는 장식 글씨가 흐릅니다.
   * - `memory` — `Visit Memory` 팝업. 장식 없이 제목·매장·날짜·본문을 위에서부터 흘립니다.
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

  const sections = (
    <View style={isArc ? styles.sectionsArc : styles.sectionsMemory}>
      {content.sections.map((section) => (
        <View key={section.id}>
          {section.title === undefined ? null : (
            <Text style={[styles.sectionTitle, isArc && styles.sectionTitleArc]}>
              {section.title}
            </Text>
          )}

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
  );

  return (
    <View style={[styles.sheet, style]}>
      <Image
        source={letterPaper}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        accessible={false}
      />

      {isArc ? (
        <>
          <Image
            source={reimaginedForYou}
            style={styles.script}
            contentFit="contain"
            accessible={false}
          />

          <Text style={styles.titleArc}>{content.title}</Text>

          {/* 밑줄은 본문보다 넓게 그어져서 본문 자리와 따로 잡습니다. */}
          <View style={styles.rules}>
            <View style={styles.rule} />
            <View style={styles.rule} />
          </View>

          <View style={styles.bodyArc}>{sections}</View>

          <View style={styles.footer}>
            {content.place === undefined ? null : (
              <Text style={styles.footerLine}>{content.place}</Text>
            )}
            {content.issuedOn === undefined ? null : (
              <Text style={styles.footerLine}>{content.issuedOn}</Text>
            )}
          </View>
        </>
      ) : (
        <View style={styles.bodyMemory}>
          <View>
            <Text style={styles.titleMemory}>{content.title}</Text>
            {content.place === undefined ? null : <Text style={styles.meta}>{content.place}</Text>}
            {content.issuedOn === undefined ? null : (
              <Text style={styles.meta}>{content.issuedOn}</Text>
            )}
          </View>

          {sections}
        </View>
      )}
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
  titleArc: {
    ...Typography.titleEn24,
    fontSize: TITLE_FONT_SIZE,
    lineHeight: TITLE_FONT_SIZE * LineHeightRatio.base,
    color: FixedColors.cardAccent,
    textAlign: 'center',
    position: 'absolute',
    top: TITLE_TOP,
    left: 0,
    right: TITLE_RIGHT,
  },
  rules: {
    position: 'absolute',
    top: RULE_TOP,
    left: RULE_LEFT,
    right: RULE_RIGHT,
    gap: RULE_GAP,
  },
  rule: {
    height: RULE_WIDTH,
    backgroundColor: FixedColors.cardAccent,
  },
  bodyArc: {
    position: 'absolute',
    top: BODY_TOP_ARC,
    left: PADDING_LEFT,
    right: PADDING_RIGHT_ARC,
  },
  footer: {
    position: 'absolute',
    top: FOOTER_TOP,
    left: PADDING_LEFT,
    right: FOOTER_RIGHT,
  },
  footerLine: {
    fontFamily: Typography.bodyKo13.fontFamily,
    fontSize: FOOTER_FONT_SIZE,
    lineHeight: FOOTER_FONT_SIZE * LineHeightRatio.display,
    fontWeight: Typography.bodyKo13.fontWeight,
    color: FixedColors.cardMuted,
  },
  bodyMemory: {
    flex: 1,
    paddingTop: PADDING_TOP_MEMORY,
    paddingLeft: PADDING_LEFT,
    paddingRight: PADDING_RIGHT_MEMORY,
    gap: SECTION_GAP_MEMORY,
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
  sectionsArc: {
    gap: SECTION_GAP_ARC,
  },
  sectionsMemory: {
    gap: SECTION_GAP_MEMORY,
  },
  sectionTitle: {
    ...Typography.titleEn14,
    color: FixedColors.cardAccent,
  },
  sectionTitleArc: {
    fontSize: SECTION_TITLE_FONT_SIZE_ARC,
    lineHeight: SECTION_TITLE_FONT_SIZE_ARC * LineHeightRatio.base,
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
